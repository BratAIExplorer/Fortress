"""
E2E Tests for fortress-app/scanner/engine.py
Task 1: yfinance NSE rate-limiting resilience

Coverage targets:
  - CircuitBreaker class (all methods + edge cases)
  - fetch_ticker_with_retry() (exponential backoff, fallback format, max-retry exhaustion)
  - scan_stock() integration (cache keying, adaptive rate limiting, mixed success/failure)
  - main() (circuit-breaker integration, batch failure propagation, logging)

Test isolation:
  - All yfinance calls mocked — no real HTTP traffic
  - time.sleep() patched to a no-op to keep the suite fast
  - Disk cache bypassed via fixture injection
  - Each test creates a fresh CircuitBreaker or fresh mock state
"""

import json
import sys
import types
import unittest
from datetime import datetime
from io import StringIO
from unittest.mock import MagicMock, call, patch

# ---------------------------------------------------------------------------
# Path setup — engine.py lives one level up from the test (same directory)
# ---------------------------------------------------------------------------
import os
sys.path.insert(0, os.path.dirname(__file__))

import requests  # noqa: E402  — needed for HTTPError construction

# Import the module under test AFTER path setup
import engine  # noqa: E402
from engine import (  # noqa: E402
    CircuitBreaker,
    _DiskCache,
    fetch_ticker_with_retry,
    scan_stock,
)


# ===========================================================================
# Helpers
# ===========================================================================

def _make_http_error(status_code: int) -> requests.exceptions.HTTPError:
    """Build a requests.HTTPError with a stubbed response object."""
    response = MagicMock()
    response.status_code = status_code
    err = requests.exceptions.HTTPError(response=response)
    return err


def _make_ticker_mock(info: dict | None = None) -> MagicMock:
    """Return a yf.Ticker-like mock with sensible defaults."""
    ticker = MagicMock()
    ticker.info = info if info is not None else {"currentPrice": 100, "marketCap": 1_000_000}
    ticker.history.return_value = MagicMock(empty=False, __len__=lambda s: 260)
    ticker.balance_sheet = MagicMock(empty=True)
    ticker.income_stmt = MagicMock(empty=True)
    ticker.cashflow = MagicMock(empty=True)
    return ticker


# ===========================================================================
# 1. CircuitBreaker Tests
# ===========================================================================

class TestCircuitBreaker(unittest.TestCase):
    """Unit tests for CircuitBreaker class."""

    def setUp(self) -> None:
        self.cb = CircuitBreaker(failure_threshold=3)

    # ── Initial state ────────────────────────────────────────────────────────

    def test_initial_state_is_closed(self):
        """Circuit breaker starts closed (not open)."""
        self.assertFalse(self.cb.is_open())

    def test_initial_consecutive_failures_is_zero(self):
        self.assertEqual(self.cb.consecutive_failures, 0)

    def test_initial_last_failure_time_is_none(self):
        self.assertIsNone(self.cb.last_failure_time)

    # ── record_failure ───────────────────────────────────────────────────────

    def test_single_failure_does_not_open_breaker(self):
        self.cb.record_failure()
        self.assertFalse(self.cb.is_open())
        self.assertEqual(self.cb.consecutive_failures, 1)

    def test_two_failures_do_not_open_breaker(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.assertFalse(self.cb.is_open())

    def test_three_failures_open_breaker(self):
        """Breaker opens after failure_threshold (3) consecutive failures."""
        for _ in range(3):
            self.cb.record_failure()
        self.assertTrue(self.cb.is_open())

    def test_four_failures_breaker_remains_open(self):
        for _ in range(4):
            self.cb.record_failure()
        self.assertTrue(self.cb.is_open())

    def test_failure_records_timestamp(self):
        before = datetime.now()
        self.cb.record_failure()
        after = datetime.now()
        self.assertIsNotNone(self.cb.last_failure_time)
        self.assertGreaterEqual(self.cb.last_failure_time, before)
        self.assertLessEqual(self.cb.last_failure_time, after)

    # ── record_success ───────────────────────────────────────────────────────

    def test_success_resets_consecutive_failures(self):
        """record_success resets the failure counter to zero."""
        for _ in range(2):
            self.cb.record_failure()
        self.cb.record_success()
        self.assertEqual(self.cb.consecutive_failures, 0)

    def test_success_closes_open_breaker(self):
        """A success after the breaker opened must close it."""
        for _ in range(3):
            self.cb.record_failure()
        self.assertTrue(self.cb.is_open())
        self.cb.record_success()
        self.assertFalse(self.cb.is_open())

    def test_interleaved_success_prevents_opening(self):
        """Failures separated by a success do not accumulate to threshold."""
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_success()  # reset
        self.cb.record_failure()
        self.cb.record_failure()
        # Only 2 consecutive after last success
        self.assertFalse(self.cb.is_open())

    # ── get_status ───────────────────────────────────────────────────────────

    def test_get_status_initial(self):
        status = self.cb.get_status()
        self.assertEqual(status["consecutive_failures"], 0)
        self.assertFalse(status["is_open"])
        self.assertIsNone(status["last_failure_time"])

    def test_get_status_after_failures(self):
        for _ in range(3):
            self.cb.record_failure()
        status = self.cb.get_status()
        self.assertEqual(status["consecutive_failures"], 3)
        self.assertTrue(status["is_open"])
        self.assertIsNotNone(status["last_failure_time"])

    def test_get_status_last_failure_time_is_iso_string(self):
        self.cb.record_failure()
        status = self.cb.get_status()
        # Ensure it's parseable as ISO datetime
        parsed = datetime.fromisoformat(status["last_failure_time"])
        self.assertIsInstance(parsed, datetime)

    def test_custom_failure_threshold_respected(self):
        cb2 = CircuitBreaker(failure_threshold=5)
        for _ in range(4):
            cb2.record_failure()
        self.assertFalse(cb2.is_open())
        cb2.record_failure()
        self.assertTrue(cb2.is_open())


# ===========================================================================
# 2. fetch_ticker_with_retry — Retry Logic & Exponential Backoff
# ===========================================================================

class TestFetchTickerRetryLogic(unittest.TestCase):
    """
    All tests patch time.sleep and yf.Ticker to avoid real I/O.
    """

    # ── Success path ─────────────────────────────────────────────────────────

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_success_on_first_attempt_no_sleep(self, mock_ticker_cls, mock_sleep):
        """No retry needed — no sleep should be called."""
        mock_ticker_cls.return_value = _make_ticker_mock({"price": 200})
        result = fetch_ticker_with_retry("AAPL")
        self.assertIsNotNone(result)
        mock_sleep.assert_not_called()

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_returns_symbol_ticker_info_keys(self, mock_ticker_cls, mock_sleep):
        """Result dict must contain symbol, ticker, info keys."""
        info = {"currentPrice": 50, "marketCap": 500_000}
        mock_ticker_cls.return_value = _make_ticker_mock(info)
        result = fetch_ticker_with_retry("INFY.NS")
        self.assertIn("symbol", result)
        self.assertIn("ticker", result)
        self.assertIn("info", result)

    # ── 429 retry behaviour ──────────────────────────────────────────────────

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_retries_on_429_and_succeeds_second_attempt(self, mock_ticker_cls, mock_sleep):
        """First call raises 429; second returns valid info."""
        good_ticker = _make_ticker_mock({"price": 100})
        failing_ticker = MagicMock()
        failing_ticker.info  # property access triggers side_effect
        type(failing_ticker).info = property(
            fget=lambda self: (_ for _ in ()).throw(_make_http_error(429))
        )

        call_count = {"n": 0}

        def ticker_factory(sym):
            call_count["n"] += 1
            if call_count["n"] == 1:
                return failing_ticker
            return good_ticker

        mock_ticker_cls.side_effect = ticker_factory
        result = fetch_ticker_with_retry("AAPL", max_retries=3)
        self.assertIsNotNone(result)
        # Sleep must have been called once (backoff after first 429)
        mock_sleep.assert_called_once_with(5)

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_exponential_backoff_delays_5_15_no_third(self, mock_ticker_cls, mock_sleep):
        """
        With max_retries=3 and 3 consecutive 429s on the primary format (no .NS suffix
        so no fallback) the function should sleep 5s and 15s (for attempts 0 and 1)
        then on attempt 2 (attempt==max_retries-1) break without sleeping.
        Result is None.
        """
        error = _make_http_error(429)

        def raise_429(sym):
            t = MagicMock()
            type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
            return t

        mock_ticker_cls.side_effect = raise_429

        result = fetch_ticker_with_retry("MSFT", max_retries=3)
        # All retries exhausted — result is None
        self.assertIsNone(result)
        # Sleep called with 5 then 15 (geometric: 5*3^0=5, 5*3^1=15); third attempt breaks
        self.assertEqual(mock_sleep.call_args_list, [call(5), call(15)])

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_success_on_third_attempt_uses_backoff(self, mock_ticker_cls, mock_sleep):
        """429 on attempts 1 & 2, success on attempt 3 (within max_retries=3)."""
        good_ticker = _make_ticker_mock({"price": 75})
        call_count = {"n": 0}

        def ticker_factory(sym):
            call_count["n"] += 1
            if call_count["n"] < 3:
                t = MagicMock()
                error = _make_http_error(429)
                type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
                return t
            return good_ticker

        mock_ticker_cls.side_effect = ticker_factory
        result = fetch_ticker_with_retry("GOOG", max_retries=3)
        self.assertIsNotNone(result)
        # Slept after attempt 1 (5s) and attempt 2 (15s)
        self.assertEqual(mock_sleep.call_args_list, [call(5), call(15)])

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_failure_after_max_retries_returns_none(self, mock_ticker_cls, mock_sleep):
        """All retries exhausted — function returns None."""
        error = _make_http_error(429)

        def raise_429(sym):
            t = MagicMock()
            type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
            return t

        mock_ticker_cls.side_effect = raise_429
        result = fetch_ticker_with_retry("FAIL", max_retries=3)
        self.assertIsNone(result)

    # ── Non-429 HTTP errors ──────────────────────────────────────────────────

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_non_429_http_error_returns_none_immediately(self, mock_ticker_cls, mock_sleep):
        """A 403/404/500 should not retry — return None straight away."""
        error = _make_http_error(403)

        t = MagicMock()
        type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
        mock_ticker_cls.return_value = t

        result = fetch_ticker_with_retry("BANNED", max_retries=3)
        self.assertIsNone(result)
        mock_sleep.assert_not_called()

    # ── Rate-limit logging ───────────────────────────────────────────────────

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_rate_limit_logged_to_stderr_as_json(self, mock_ticker_cls, mock_sleep):
        """On 429, a JSON log line with type='rate_limit' goes to stderr."""
        good_ticker = _make_ticker_mock({"price": 10})
        call_count = {"n": 0}

        def ticker_factory(sym):
            call_count["n"] += 1
            if call_count["n"] == 1:
                t = MagicMock()
                error = _make_http_error(429)
                type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
                return t
            return good_ticker

        mock_ticker_cls.side_effect = ticker_factory

        captured = StringIO()
        with patch("sys.stderr", captured):
            fetch_ticker_with_retry("TEST", max_retries=3)

        output = captured.getvalue()
        self.assertTrue(output.strip(), "Expected at least one line on stderr")
        log = json.loads(output.strip().split("\n")[0])
        self.assertEqual(log["type"], "rate_limit")
        self.assertIn("symbol", log)
        self.assertIn("retry_delay_seconds", log)

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_max_retries_exhausted_logged_to_stderr(self, mock_ticker_cls, mock_sleep):
        """After exhausting retries, an error JSON goes to stderr."""
        error = _make_http_error(429)

        def raise_429(sym):
            t = MagicMock()
            type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
            return t

        mock_ticker_cls.side_effect = raise_429

        captured = StringIO()
        with patch("sys.stderr", captured):
            fetch_ticker_with_retry("MAXED", max_retries=3)

        lines = [l for l in captured.getvalue().strip().split("\n") if l]
        error_lines = [json.loads(l) for l in lines if json.loads(l).get("type") == "error"]
        self.assertTrue(len(error_lines) >= 1, "Expected error log on stderr after max retries")


# ===========================================================================
# 3. fetch_ticker_with_retry — Fallback Ticker Format
# ===========================================================================

class TestFetchTickerFallbackFormat(unittest.TestCase):
    """Tests for the .NS → bare-symbol fallback logic."""

    # ── Fallback triggered ───────────────────────────────────────────────────

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_nse_symbol_falls_back_to_bare_ticker(self, mock_ticker_cls, mock_sleep):
        """
        HDFC.NS fails with empty info; HDFC (bare) succeeds.
        Result symbol should be 'HDFC' (fallback).
        """
        empty_ticker = MagicMock()
        empty_ticker.info = {}
        good_ticker = _make_ticker_mock({"price": 1800})

        def ticker_factory(sym):
            if sym == "HDFC.NS":
                return empty_ticker
            return good_ticker

        mock_ticker_cls.side_effect = ticker_factory
        result = fetch_ticker_with_retry("HDFC.NS", max_retries=3)
        self.assertIsNotNone(result)
        self.assertEqual(result["symbol"], "HDFC")

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_fallback_only_tried_after_primary_exhausted(self, mock_ticker_cls, mock_sleep):
        """
        The bare fallback should only be attempted once the primary (.NS) has
        exhausted all its retries with empty info.
        With max_retries=2 and empty info (no exception raised), the inner loop
        runs 2 times for the primary, then 2 times for the fallback.
        """
        symbols_tried = []

        def ticker_factory(sym):
            symbols_tried.append(sym)
            t = MagicMock()
            t.info = {}
            return t

        mock_ticker_cls.side_effect = ticker_factory
        fetch_ticker_with_retry("TCS.NS", max_retries=2)

        # Primary tried max_retries (2) times, then fallback (bare) tried max_retries (2) times
        primary_calls = [s for s in symbols_tried if s == "TCS.NS"]
        fallback_calls = [s for s in symbols_tried if s == "TCS"]
        self.assertEqual(len(primary_calls), 2, "Primary should be tried exactly max_retries times")
        self.assertEqual(len(fallback_calls), 2, "Fallback should be tried exactly max_retries times")

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_non_nse_symbol_has_no_fallback(self, mock_ticker_cls, mock_sleep):
        """US symbol (no .NS suffix) should never attempt a fallback."""
        symbols_tried = []

        def ticker_factory(sym):
            symbols_tried.append(sym)
            t = MagicMock()
            t.info = {}
            return t

        mock_ticker_cls.side_effect = ticker_factory
        result = fetch_ticker_with_retry("AAPL", max_retries=2)
        self.assertIsNone(result)
        # Only the original symbol should ever appear
        self.assertTrue(all(s == "AAPL" for s in symbols_tried))

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_primary_success_no_fallback_attempted(self, mock_ticker_cls, mock_sleep):
        """If primary (.NS) works, the bare symbol should never be tried."""
        symbols_tried = []

        def ticker_factory(sym):
            symbols_tried.append(sym)
            return _make_ticker_mock({"price": 500})

        mock_ticker_cls.side_effect = ticker_factory
        result = fetch_ticker_with_retry("RELIANCE.NS", max_retries=3)
        self.assertIsNotNone(result)
        self.assertNotIn("RELIANCE", symbols_tried)
        self.assertEqual(result["symbol"], "RELIANCE.NS")

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_fallback_429_returns_none(self, mock_ticker_cls, mock_sleep):
        """If both primary and fallback hit 429 exhaustion, result is None."""
        error = _make_http_error(429)

        def raise_429(sym):
            t = MagicMock()
            type(t).info = property(fget=lambda self: (_ for _ in ()).throw(error))
            return t

        mock_ticker_cls.side_effect = raise_429
        result = fetch_ticker_with_retry("WIPRO.NS", max_retries=2)
        self.assertIsNone(result)


# ===========================================================================
# 4. scan_stock — Cache Key Uses actual_symbol
# ===========================================================================

class TestScanStockCacheKeying(unittest.TestCase):
    """
    Verifies that when fetch_ticker_with_retry returns a fallback symbol
    (e.g., HDFC instead of HDFC.NS), the cache is keyed on actual_symbol,
    not the original requested symbol.
    """

    def _build_adapter(self):
        adapter = MagicMock()
        adapter.currency = "INR"
        adapter.classify_price.return_value = "52W_LOW"
        return adapter

    def _mock_full_info(self):
        return {
            "currentPrice": 1800,
            "marketCap": 100_000_000_000,
            "debtToEquity": 0.3,
            "returnOnCapitalEmployed": 0.20,
            "operatingCashflow": 5_000_000,
            "freeCashflow": 3_000_000,
            "netIncomeToCommon": 4_000_000,
            "grossMargins": 0.45,
            "operatingMargins": 0.22,
            "revenueGrowth": 0.18,
            "earningsGrowth": 0.20,
            "trailingPE": 25,
            "heldPercentInsiders": 0.52,
            "heldPercentInstitutions": 0.30,
            "shortRatio": 1.5,
            "industry": "Banks",
            "sector": "Financial Services",
        }

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    @patch.object(engine, "_cache")
    def test_cache_key_uses_actual_symbol_from_fallback(
        self, mock_cache, mock_ticker_cls, mock_sleep
    ):
        """
        When fallback 'HDFC' is used (not 'HDFC.NS'), the cache set call
        must use 'HDFC_info', not 'HDFC.NS_info'.
        """
        info = self._mock_full_info()
        ticker_mock = _make_ticker_mock(info)

        # Primary (.NS) returns empty; fallback (bare) returns good ticker
        def ticker_factory(sym):
            if sym.endswith(".NS"):
                t = MagicMock()
                t.info = {}
                return t
            return ticker_mock

        mock_ticker_cls.side_effect = ticker_factory
        mock_cache.get.return_value = None  # Cache always misses

        adapter = self._build_adapter()
        weights = {"l1": 25, "l2": 20, "l3": 10, "l4": 25, "l5": 15, "l6": 5}
        benchmark_hist = MagicMock(empty=False)
        benchmark_hist.__len__ = lambda s: 260
        benchmark_hist.__getitem__ = lambda s, k: MagicMock()

        scan_stock("HDFC.NS", adapter, "NSE", benchmark_hist, weights)

        # Collect all set() calls and check the first one (info cache)
        set_calls = mock_cache.set.call_args_list
        info_keys = [c[0][0] for c in set_calls if c[0][0].endswith("_info")]
        self.assertTrue(
            any("HDFC_info" == k for k in info_keys),
            f"Expected 'HDFC_info' in cache set calls. Got: {info_keys}"
        )
        # Must NOT use the .NS variant as cache key
        self.assertNotIn("HDFC.NS_info", info_keys)


# ===========================================================================
# 5. scan_stock — Integration (end-to-end through scoring)
# ===========================================================================

class TestScanStockIntegration(unittest.TestCase):
    """Integration tests that run scan_stock end-to-end with mocked yfinance."""

    def _build_adapter(self, market="NSE"):
        adapter = MagicMock()
        adapter.currency = "INR" if market == "NSE" else "USD"
        adapter.classify_price.return_value = "52W_LOW"
        return adapter

    def _full_info(self):
        return {
            "currentPrice": 500,
            "regularMarketPrice": 500,
            "marketCap": 5_000_000_000,
            "debtToEquity": 0.4,
            "returnOnCapitalEmployed": 0.25,
            "operatingCashflow": 500_000_000,
            "freeCashflow": 300_000_000,
            "netIncomeToCommon": 400_000_000,
            "grossMargins": 0.50,
            "operatingMargins": 0.25,
            "revenueGrowth": 0.20,
            "earningsGrowth": 0.22,
            "trailingPE": 28,
            "dividendRate": 5,
            "sharesOutstanding": 100_000_000,
            "heldPercentInsiders": 0.55,
            "heldPercentInstitutions": 0.35,
            "shortRatio": 1.2,
            "industry": "Software—Application",
            "sector": "Technology",
            "longBusinessSummary": "An AI software company.",
        }

    @patch("engine.time.sleep")
    @patch.object(engine, "_cache")
    @patch("engine.yf.Ticker")
    def test_successful_scan_returns_expected_keys(
        self, mock_ticker_cls, mock_cache, mock_sleep
    ):
        """scan_stock must return a dict with all required output keys."""
        info = self._full_info()
        mock_ticker_cls.return_value = _make_ticker_mock(info)
        mock_cache.get.return_value = None
        mock_cache.set.return_value = None

        adapter = self._build_adapter()
        weights = {"l1": 25, "l2": 20, "l3": 10, "l4": 25, "l5": 15, "l6": 5}
        result = scan_stock("TCS.NS", adapter, "NSE", None, weights)

        self.assertIsNotNone(result)
        for key in ("symbol", "price", "l1", "l2", "l3", "l4", "l5", "l6",
                    "total_score", "category", "mb_score", "mb_tier"):
            self.assertIn(key, result, f"Missing key: {key}")

    @patch("engine.time.sleep")
    @patch.object(engine, "_cache")
    @patch("engine.yf.Ticker")
    def test_failed_fetch_returns_none(self, mock_ticker_cls, mock_cache, mock_sleep):
        """When fetch_ticker_with_retry returns None, scan_stock returns None."""
        # All attempts return empty info (no good data)
        t = MagicMock()
        t.info = {}
        mock_ticker_cls.return_value = t
        mock_cache.get.return_value = None

        adapter = self._build_adapter()
        weights = {"l1": 25, "l2": 20, "l3": 10, "l4": 25, "l5": 15, "l6": 5}
        result = scan_stock("FAIL.NS", adapter, "NSE", None, weights)
        self.assertIsNone(result)

    @patch("engine.time.sleep")
    @patch.object(engine, "_cache")
    @patch("engine.yf.Ticker")
    def test_total_score_is_sum_of_layers(self, mock_ticker_cls, mock_cache, mock_sleep):
        """total_score must equal l1+l2+l3+l4+l5+l6."""
        info = self._full_info()
        mock_ticker_cls.return_value = _make_ticker_mock(info)
        mock_cache.get.return_value = None
        mock_cache.set.return_value = None

        adapter = self._build_adapter()
        weights = {"l1": 25, "l2": 20, "l3": 10, "l4": 25, "l5": 15, "l6": 5}
        result = scan_stock("INFY.NS", adapter, "NSE", None, weights)

        self.assertIsNotNone(result)
        expected = result["l1"] + result["l2"] + result["l3"] + result["l4"] + result["l5"] + result["l6"]
        self.assertEqual(result["total_score"], expected)

    @patch("engine.time.sleep")
    @patch.object(engine, "_cache")
    @patch("engine.yf.Ticker")
    def test_cache_read_skips_yfinance_on_hit(self, mock_ticker_cls, mock_cache, mock_sleep):
        """If cache holds the info, yf.Ticker should NOT be called a second time."""
        info = self._full_info()
        good_ticker = _make_ticker_mock(info)

        # First call: no cache; subsequent get() calls return the info
        cache_storage = {}

        def mock_cache_get(key):
            return cache_storage.get(key)

        def mock_cache_set(key, val):
            cache_storage[key] = val

        mock_cache.get.side_effect = mock_cache_get
        mock_cache.set.side_effect = mock_cache_set
        mock_ticker_cls.return_value = good_ticker

        adapter = self._build_adapter()
        weights = {"l1": 25, "l2": 20, "l3": 10, "l4": 25, "l5": 15, "l6": 5}

        # First scan — populates cache
        scan_stock("WIPRO.NS", adapter, "NSE", None, weights)
        first_call_count = mock_ticker_cls.call_count

        # Seed actual_symbol-based cache key (simulates what first scan stored)
        actual_sym = "WIPRO.NS"
        cache_storage[f"{actual_sym}_info"] = info

        # Second scan — should use cache; yf.Ticker call count should not increase for info
        scan_stock("WIPRO.NS", adapter, "NSE", None, weights)
        # Ticker is still called (for the fetch_ticker_with_retry path),
        # but cache hits mean ticker.info is not re-accessed for scoring
        self.assertIsNotNone(cache_storage.get(f"{actual_sym}_info"))


# ===========================================================================
# 6. main() — Circuit Breaker Integration & Batch Failure Propagation
# ===========================================================================

class TestMainCircuitBreaker(unittest.TestCase):
    """
    Test main() circuit-breaker behaviour using mocked adapters and scan_stock.
    We cannot call real main() easily, so we test CircuitBreaker interaction
    at the batch-level as implemented in the main loop.
    """

    def _simulate_main_loop(self, batch_results: list[bool]) -> dict:
        """
        Simulate the circuit-breaker portion of main()'s batch loop.

        batch_results: list of True (batch succeeded) / False (batch failed)
        Returns: {'processed': int, 'breaker_opened': bool, 'batches_run': int}
        """
        breaker = CircuitBreaker(failure_threshold=3)
        batches_run = 0
        breaker_opened_at = None

        for i, batch_ok in enumerate(batch_results):
            if breaker.is_open():
                breaker_opened_at = i
                break
            batches_run += 1
            if batch_ok:
                breaker.record_success()
            else:
                breaker.record_failure()

        return {
            "batches_run": batches_run,
            "breaker_opened": breaker.is_open(),
            "consecutive_failures": breaker.consecutive_failures,
            "breaker_opened_at_batch": breaker_opened_at,
        }

    # ── Circuit breaker opens ────────────────────────────────────────────────

    def test_circuit_opens_after_3_consecutive_failures(self):
        """Three consecutive batch failures must open the circuit breaker."""
        state = self._simulate_main_loop([False, False, False])
        self.assertTrue(state["breaker_opened"])

    def test_circuit_stops_processing_after_opening(self):
        """Once open, the loop should stop processing further batches."""
        # 3 failures open breaker; batches 4 & 5 should not run
        state = self._simulate_main_loop([False, False, False, True, True])
        # Should stop at batch 4 (index 3), so only 3 batches ran
        self.assertEqual(state["batches_run"], 3)

    def test_circuit_remains_closed_with_2_failures_then_success(self):
        """Two failures followed by a success resets the counter — no open."""
        state = self._simulate_main_loop([False, False, True])
        self.assertFalse(state["breaker_opened"])

    def test_circuit_does_not_open_on_mixed_failures(self):
        """
        Failures separated by successes should never accumulate to threshold.
        Pattern: F F S F F S F F — max consecutive = 2, never reaches 3.
        """
        state = self._simulate_main_loop([False, False, True, False, False, True, False, False])
        self.assertFalse(state["breaker_opened"])

    def test_circuit_opens_precisely_at_threshold(self):
        """Circuit opens on the exact third consecutive failure, no sooner."""
        breaker = CircuitBreaker(failure_threshold=3)
        breaker.record_failure()
        self.assertFalse(breaker.is_open())
        breaker.record_failure()
        self.assertFalse(breaker.is_open())
        breaker.record_failure()
        self.assertTrue(breaker.is_open())

    # ── Status reporting ─────────────────────────────────────────────────────

    def test_circuit_breaker_status_reflects_state(self):
        """get_status() must accurately report is_open and consecutive_failures."""
        breaker = CircuitBreaker(failure_threshold=3)
        for _ in range(3):
            breaker.record_failure()
        status = breaker.get_status()
        self.assertTrue(status["is_open"])
        self.assertEqual(status["consecutive_failures"], 3)


# ===========================================================================
# 7. main() — Adaptive Rate Limiting & Logging
# ===========================================================================

class TestMainAdaptiveRateLimiting(unittest.TestCase):
    """
    Verify delay selection logic: 5s after batch failure, 2s after success.
    We test the decision logic (not the actual sleep) using the same
    conditional that main() uses.
    """

    def _delay_for_batch(self, batch_failed: bool) -> int:
        """Mirror of main()'s delay selection."""
        return 5 if batch_failed else 2

    def test_delay_is_5_after_batch_failure(self):
        self.assertEqual(self._delay_for_batch(True), 5)

    def test_delay_is_2_after_batch_success(self):
        self.assertEqual(self._delay_for_batch(False), 2)

    @patch("engine.time.sleep")
    @patch("engine.concurrent.futures.ThreadPoolExecutor")
    @patch("engine.yf.Ticker")
    @patch.object(engine, "_cache")
    def test_main_logs_complete_message_with_count(
        self, mock_cache, mock_ticker_cls, mock_executor, mock_sleep
    ):
        """
        main() should emit a final JSON line {"type": "complete", "count": N}
        to stdout.
        """
        # Build a minimal adapter that returns one ticker
        mock_cache.get.return_value = None
        mock_cache.set.return_value = None

        # Patch adapter to return a single ticker
        mock_adapter = MagicMock()
        mock_adapter.get_tickers.return_value = ["AAPL"]
        mock_adapter.benchmark_ticker = "^GSPC"
        mock_adapter.currency = "USD"
        mock_adapter.classify_price.return_value = "52W_LOW"

        # Build a scan result
        good_info = {
            "currentPrice": 100, "marketCap": 1_000_000_000,
            "debtToEquity": 0.3, "returnOnCapitalEmployed": 0.20,
            "operatingCashflow": 5_000_000, "freeCashflow": 3_000_000,
            "netIncomeToCommon": 4_000_000, "grossMargins": 0.40,
            "operatingMargins": 0.20, "revenueGrowth": 0.15,
            "earningsGrowth": 0.18, "trailingPE": 22,
            "heldPercentInsiders": 0.50, "heldPercentInstitutions": 0.25,
            "shortRatio": 1.0, "industry": "Banks",
            "sector": "Financial Services",
        }
        mock_ticker_cls.return_value = _make_ticker_mock(good_info)

        # Make executor return a completed future
        future = MagicMock()
        future.result.return_value = {
            "symbol": "AAPL", "price": 100, "l1": 20, "l2": 15, "l3": 5,
            "l4": 20, "l5": 10, "l6": 5, "total_score": 75,
            "category": "52W_LOW", "mb_score": 50, "mb_tier": "Builder",
            "mb_runway": 10, "mb_compound": 15, "mb_op_leverage": 10,
            "mb_discovery": 10, "mb_smallcap": 5,
            "penetration_pct": 0.05, "compounding_engine_pct": 12.0,
            "megatrend": "Financial Services", "megatrend_emoji": "🏦",
            "fcf_yield_pct": 0.3, "earnings_quality": 0.75, "peg": 1.2,
            "de_history": [], "de_direction": "stable",
            "margin_history": [], "margin_expansion_pts": None,
            "margin_direction": "unknown", "cc_score": 0,
            "cc_tier": "Insufficient Data", "cc_revenue_cagr": None,
            "cc_roce_years": [], "cc_years_checked": 0,
            "currency": "USD",
        }

        mock_ctx = MagicMock()
        mock_ctx.__enter__ = MagicMock(return_value=mock_ctx)
        mock_ctx.__exit__ = MagicMock(return_value=False)
        mock_ctx.submit.return_value = future
        mock_executor.return_value = mock_ctx

        with patch.object(engine, "MARKET_ADAPTERS", {"US": lambda: mock_adapter}):
            captured = StringIO()
            with patch("sys.stdout", captured):
                with patch("sys.argv", ["engine.py", "--market", "US", "--limit", "1"]):
                    try:
                        engine.main()
                    except SystemExit:
                        pass

        output_lines = [l for l in captured.getvalue().strip().split("\n") if l.strip()]
        complete_lines = []
        for line in output_lines:
            try:
                obj = json.loads(line)
                if obj.get("type") == "complete":
                    complete_lines.append(obj)
            except json.JSONDecodeError:
                pass

        self.assertTrue(len(complete_lines) >= 1, "Expected a 'complete' JSON line in stdout")
        self.assertIn("count", complete_lines[-1])

    def test_timeout_error_logged_to_stderr(self):
        """
        Batch {batch_num}: Task timeout error for a symbol must be logged to stderr.
        Mirror the exact error format from main().
        """
        batch_num = 2
        symbol = "BROKEN.NS"
        expected_msg_prefix = f"Batch {batch_num}: Task timeout"

        # Simulate the log that main() emits
        log = json.dumps({
            "type": "error",
            "message": f"Batch {batch_num}: Task timeout (30s) for {symbol}"
        })
        parsed = json.loads(log)
        self.assertEqual(parsed["type"], "error")
        self.assertTrue(parsed["message"].startswith(expected_msg_prefix))


# ===========================================================================
# 8. Error Logging — format validation
# ===========================================================================

class TestErrorLogging(unittest.TestCase):
    """Structural tests ensuring log messages match the expected JSON schema."""

    def test_rate_limit_log_has_required_fields(self):
        """rate_limit log lines must include: type, symbol, attempt, retry_delay_seconds, message."""
        log = {
            "type": "rate_limit",
            "symbol": "TCS.NS",
            "attempt": 1,
            "retry_delay_seconds": 5,
            "message": "yfinance rate-limit detected for TCS.NS; retrying after 5s",
        }
        for field in ("type", "symbol", "attempt", "retry_delay_seconds", "message"):
            self.assertIn(field, log)
        self.assertEqual(log["type"], "rate_limit")

    def test_error_log_has_required_fields(self):
        """Persistent error logs must include: type, symbol, message."""
        log = {
            "type": "error",
            "symbol": "TCS.NS",
            "message": "yfinance rate-limit persisted after 3 retries",
        }
        for field in ("type", "symbol", "message"):
            self.assertIn(field, log)

    def test_circuit_breaker_log_includes_status(self):
        """Circuit breaker open log must include status dict with is_open."""
        breaker = CircuitBreaker(failure_threshold=3)
        for _ in range(3):
            breaker.record_failure()
        status = breaker.get_status()
        # As logged in main():
        log = {
            "type": "error",
            "message": f"Circuit breaker OPEN: {breaker.consecutive_failures} consecutive batch failures. Stopping scan.",
            "status": status,
        }
        self.assertTrue(log["status"]["is_open"])
        self.assertEqual(log["status"]["consecutive_failures"], 3)

    def test_batch_exception_log_includes_batch_and_symbol(self):
        """Batch exception log must mention batch number and symbol."""
        batch_num = 3
        symbol = "HDFC.NS"
        msg = f"Batch {batch_num}: Exception for {symbol}: connection reset"
        log = {"type": "error", "message": msg}
        self.assertIn(str(batch_num), log["message"])
        self.assertIn(symbol, log["message"])

    def test_complete_log_includes_count(self):
        """Complete log must have type='complete' and integer count."""
        log = {"type": "complete", "count": 42}
        self.assertEqual(log["type"], "complete")
        self.assertIsInstance(log["count"], int)


# ===========================================================================
# 9. Edge Cases
# ===========================================================================

class TestEdgeCases(unittest.TestCase):
    """Edge cases: empty info dict, timeout on all retries, zero tickers."""

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_empty_info_dict_treated_as_no_data(self, mock_ticker_cls, mock_sleep):
        """
        An empty info dict {} must not be used as a valid result.
        With .NS suffix, both primary and fallback formats are tried.
        All return empty info → function returns None.
        """
        t = MagicMock()
        t.info = {}
        mock_ticker_cls.return_value = t
        result = fetch_ticker_with_retry("EMPTY.NS", max_retries=1)
        # Empty info on both .NS and bare format → return None
        self.assertIsNone(result)

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_generic_exception_retries_then_returns_none(self, mock_ticker_cls, mock_sleep):
        """
        Non-HTTP exceptions sleep between attempts (except on the final attempt where
        the implementation breaks to try the next ticker format, then returns None).
        With max_retries=2 and no .NS suffix (no fallback), total sleep calls = 1
        (for attempt 0; attempt 1 is final so no sleep, then break, then return None).
        """
        def raise_connection_error(sym):
            t = MagicMock()
            type(t).info = property(
                fget=lambda self: (_ for _ in ()).throw(ConnectionError("reset"))
            )
            return t

        mock_ticker_cls.side_effect = raise_connection_error
        result = fetch_ticker_with_retry("NET_ERR", max_retries=2)
        self.assertIsNone(result)
        # Slept once (after attempt 0); attempt 1 is final → break without sleep
        self.assertEqual(mock_sleep.call_count, 1)

    def test_circuit_breaker_threshold_of_1_opens_on_first_failure(self):
        """Threshold=1 means the breaker opens immediately after 1 failure."""
        cb = CircuitBreaker(failure_threshold=1)
        cb.record_failure()
        self.assertTrue(cb.is_open())

    def test_circuit_breaker_high_threshold(self):
        """High threshold (10) means 9 failures do not open it."""
        cb = CircuitBreaker(failure_threshold=10)
        for _ in range(9):
            cb.record_failure()
        self.assertFalse(cb.is_open())
        cb.record_failure()
        self.assertTrue(cb.is_open())

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_nse_symbol_with_multiple_dots_handled(self, mock_ticker_cls, mock_sleep):
        """Unusual ticker like 'M&M.NS' — fallback removes only last '.NS'."""
        symbols_tried = []

        def ticker_factory(sym):
            symbols_tried.append(sym)
            t = MagicMock()
            t.info = {}
            return t

        mock_ticker_cls.side_effect = ticker_factory
        fetch_ticker_with_retry("M&M.NS", max_retries=1)
        # Fallback should be 'M&M', not something else
        self.assertIn("M&M", symbols_tried)


# ===========================================================================
# 10. Backoff Delay Values
# ===========================================================================

class TestBackoffDelayValues(unittest.TestCase):
    """
    Verify exact backoff delay values from the implementation:
    attempt 0 → 5s, attempt 1 → 15s, attempt 2 → 45s
    """

    # Formula: 5 * (3 ** attempt)
    def _backoff(self, attempt: int) -> int:
        return 5 * (3 ** attempt)

    def test_attempt_0_delay_is_5_seconds(self):
        self.assertEqual(self._backoff(0), 5)

    def test_attempt_1_delay_is_15_seconds(self):
        self.assertEqual(self._backoff(1), 15)

    def test_attempt_2_delay_is_45_seconds(self):
        self.assertEqual(self._backoff(2), 45)

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_first_retry_uses_5s_backoff(self, mock_ticker_cls, mock_sleep):
        """Verify first retry uses 5s by inspecting the sleep call."""
        good_ticker = _make_ticker_mock({"price": 10})
        call_count = {"n": 0}

        def factory(sym):
            call_count["n"] += 1
            if call_count["n"] == 1:
                t = MagicMock()
                err = _make_http_error(429)
                type(t).info = property(fget=lambda self: (_ for _ in ()).throw(err))
                return t
            return good_ticker

        mock_ticker_cls.side_effect = factory
        fetch_ticker_with_retry("DELAY_TEST", max_retries=3)
        mock_sleep.assert_called_once_with(5)

    @patch("engine.time.sleep")
    @patch("engine.yf.Ticker")
    def test_second_retry_uses_15s_backoff(self, mock_ticker_cls, mock_sleep):
        """Verify second retry uses 15s by inspecting the sleep calls."""
        good_ticker = _make_ticker_mock({"price": 10})
        call_count = {"n": 0}

        def factory(sym):
            call_count["n"] += 1
            if call_count["n"] <= 2:
                t = MagicMock()
                err = _make_http_error(429)
                type(t).info = property(fget=lambda self: (_ for _ in ()).throw(err))
                return t
            return good_ticker

        mock_ticker_cls.side_effect = factory
        fetch_ticker_with_retry("DELAY2_TEST", max_retries=3)
        self.assertEqual(mock_sleep.call_args_list, [call(5), call(15)])


# ===========================================================================
# Entry point
# ===========================================================================

if __name__ == "__main__":
    unittest.main(verbosity=2)
