#!/usr/bin/env python3
"""
Bot Health Check — Minimal diagnostic for VPS deployment monitoring.
Run this on the VPS to verify bot environment is correctly configured.
"""
import os
import sys

def check_environment():
    """Verify all required environment variables are set."""
    required = [
        "TELEGRAM_BOT_TOKEN",
        "TELEGRAM_ADMIN_ID",
        "FORTRESS_API_URL",
        "FORTRESS_CRON_SECRET",
    ]

    missing = [var for var in required if not os.getenv(var)]
    if missing:
        print(f"❌ Missing required env vars: {', '.join(missing)}")
        return False

    print("✅ All required environment variables set")
    return True

def check_dependencies():
    """Verify Python dependencies are installed."""
    required_packages = [
        "kiteconnect",
        "yfinance",
        "pandas",
        "numpy",
        "openpyxl",
        "requests",
        "dotenv",
        "pytz",
    ]

    missing = []
    for pkg in required_packages:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)

    if missing:
        print(f"❌ Missing Python packages: {', '.join(missing)}")
        print(f"   Run: pip install -r requirements.txt")
        return False

    print("✅ All Python dependencies installed")
    return True

def check_fortress_api():
    """Test connectivity to Fortress API endpoint."""
    import requests

    url = os.getenv("FORTRESS_API_URL")
    secret = os.getenv("FORTRESS_CRON_SECRET")

    if not url or not secret:
        print("⚠️  FORTRESS_API_URL or FORTRESS_CRON_SECRET not set; skipping API check")
        return True

    try:
        response = requests.get(
            url.replace("/momentum-signals", ""),  # Just test /api/analysis
            timeout=5
        )
        if response.status_code in [200, 401, 404]:
            print(f"✅ Fortress API reachable at {url}")
            return True
        else:
            print(f"❌ Fortress API returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot reach Fortress API: {e}")
        return False

def main():
    print("🔍 MACD Bot Health Check\n")

    checks = [
        ("Environment Variables", check_environment),
        ("Python Dependencies", check_dependencies),
        ("Fortress API Connectivity", check_fortress_api),
    ]

    results = []
    for name, check_fn in checks:
        print(f"\n{name}:")
        results.append(check_fn())

    print("\n" + "="*50)
    if all(results):
        print("✅ Bot is ready for deployment!")
        sys.exit(0)
    else:
        print("❌ Bot has configuration issues. Fix above and retry.")
        sys.exit(1)

if __name__ == "__main__":
    main()
