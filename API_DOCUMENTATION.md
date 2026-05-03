# Fortress Intelligence - API Documentation

**Version:** 1.0 | **Status:** Production | **Base URL:** https://fortressintelligence.space

All endpoints are built with **Next.js API Routes** and support both JSON requests and responses. All requests should include the `Content-Type: application/json` header.

---

## Response Format

All API responses follow a consistent envelope format:

**Success Response (2xx):**
```json
{
  "success": true,
  "data": {
    // Response payload
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "errorCode": "VALIDATION_ERROR|DATABASE_ERROR|NOT_FOUND|SERVER_ERROR"
}
```

---

## Authentication

Currently, **no authentication is required** for beta testing. All endpoints are publicly accessible.

*Note: Authentication (OAuth) is planned for production rollout after user validation.*

---

## Endpoints

### 1. POST /api/allocation/generate

Generates a multi-market portfolio allocation based on user risk profile and preferences.

**Purpose:** Core Investment Genie endpoint. Takes user inputs and returns optimized allocation percentages across 6 portfolio layers, with specific stock recommendations per layer.

**URL:** `https://fortressintelligence.space/api/allocation/generate`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "age": 35,
  "investmentAmount": 100000,
  "timeHorizonYears": 20,
  "riskAppetite": "moderate",
  "selectedMarkets": ["US", "NSE"]
}
```

**Field Definitions:**
- `age` (number): Investor age, 18-100
- `investmentAmount` (number): Amount in USD/INR, minimum 10,000
- `timeHorizonYears` (number): Investment horizon, 1-50 years
- `riskAppetite` (string): One of `"conservative"`, `"moderate"`, `"aggressive"`
- `selectedMarkets` (array): One or both of `"US"` or `"NSE"`

**Response (Success 200):**
```json
{
  "success": true,
  "data": {
    "allocation": {
      "generatedAt": "2026-05-03T10:30:00Z",
      "userProfile": {
        "age": 35,
        "investmentAmount": 100000,
        "timeHorizonYears": 20,
        "riskAppetite": "moderate"
      },
      "layers": [
        {
          "layerId": 1,
          "name": "Safe Core",
          "description": "Dividend-paying stability",
          "allocationPercent": 40.1,
          "candidates": [
            {
              "symbol": "JNJ",
              "name": "Johnson & Johnson",
              "market": "US",
              "sector": "Healthcare",
              "allocationAmount": 40100,
              "reasoning": "Consistent dividend payer, strong balance sheet, defensive characteristics"
            },
            {
              "symbol": "HUL.NS",
              "name": "Hindustan Unilever",
              "market": "NSE",
              "sector": "FMCG",
              "allocationAmount": 0,
              "reasoning": "Premium FMCG, stable cash flows"
            }
          ]
        },
        {
          "layerId": 2,
          "name": "Growth Accelerators",
          "description": "Mid-cap growth momentum",
          "allocationPercent": 25.1,
          "candidates": [
            {
              "symbol": "RELIANCE.NS",
              "name": "Reliance Industries",
              "market": "NSE",
              "sector": "Energy",
              "allocationAmount": 25100,
              "reasoning": "Strong momentum, energy transition play, quality metrics"
            }
          ]
        },
        {
          "layerId": 3,
          "name": "Value Hunters",
          "description": "Undervalued opportunities",
          "allocationPercent": 15.3,
          "candidates": []
        },
        {
          "layerId": 4,
          "name": "Small Cap Plays",
          "description": "High-conviction small caps",
          "allocationPercent": 8.9,
          "candidates": []
        },
        {
          "layerId": 5,
          "name": "Speculative Edge",
          "description": "High-risk, high-reward",
          "allocationPercent": 6.2,
          "candidates": []
        },
        {
          "layerId": 6,
          "name": "Reserve / Cash",
          "description": "Dry powder for opportunities",
          "allocationPercent": 4.4,
          "candidates": []
        }
      ],
      "sectorBreakdown": {
        "Healthcare": 15.2,
        "Technology": 12.5,
        "Energy": 25.1,
        "Financials": 18.3,
        "FMCG": 10.2,
        "Industrials": 8.7,
        "Other": 10.0
      },
      "marketBreakdown": {
        "US": 50.5,
        "NSE": 49.5
      },
      "riskMetrics": {
        "volatilityScore": 5.2,
        "diversificationScore": 8.1,
        "liquidityScore": 7.8
      }
    }
  }
}
```

**Response (Error 400):**
```json
{
  "success": false,
  "error": "Invalid input: age must be between 18 and 100",
  "errorCode": "VALIDATION_ERROR"
}
```

**Validation Rules:**
- `age`: Required, number 18-100
- `investmentAmount`: Required, number ≥ 10,000
- `timeHorizonYears`: Required, number 1-50
- `riskAppetite`: Required, must be one of the enum values
- `selectedMarkets`: Required, must include at least one market

**Example cURL:**
```bash
curl -X POST https://fortressintelligence.space/api/allocation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "investmentAmount": 100000,
    "timeHorizonYears": 20,
    "riskAppetite": "moderate",
    "selectedMarkets": ["US", "NSE"]
  }'
```

---

### 2. GET /api/stocks/screen

Returns ranked stock candidates filtered by market, sector, and score thresholds.

**Purpose:** Fortress 30 core endpoint. Retrieves real-time stock screening results with full score breakdown and rankings.

**URL:** `https://fortressintelligence.space/api/stocks/screen`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| market | string | Yes | - | 'US' \| 'NSE' \| 'ALL' |
| sector | string | No | - | Filter by sector (e.g., 'Technology', 'Energy') |
| limit | number | No | 30 | Number of results (1-500) |
| offset | number | No | 0 | Pagination offset |
| minScore | number | No | 0 | Minimum total score (0-100) |
| sortBy | string | No | 'total_score' | 'total_score' \| 'mb_score' \| 'cc_score' \| 'fcf_yield' |
| sortOrder | string | No | 'DESC' | 'ASC' \| 'DESC' |

**Response (Success 200):**
```json
{
  "success": true,
  "data": {
    "market": "US",
    "query": {
      "sector": null,
      "minScore": 0,
      "limit": 30,
      "offset": 0,
      "sortBy": "total_score",
      "sortOrder": "DESC"
    },
    "totalCount": 346,
    "candidates": [
      {
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "market": "US",
        "sector": "Technology",
        "price": 425.50,
        "marketCap": 3200000000000,
        "totalScore": 87.3,
        "scoreBreakdown": {
          "l1_score": 92,
          "l1_name": "Solvency",
          "l2_score": 88,
          "l2_name": "Pricing Power",
          "l3_score": 85,
          "l3_name": "Relative Strength",
          "l4_score": 89,
          "l4_name": "Growth",
          "l5_score": 84,
          "l5_name": "Governance",
          "l6_score": 81,
          "l6_name": "Valuation"
        },
        "mbScore": 8.7,
        "mbTier": "Strong",
        "mbRunway": 12.3,
        "mbCompoundingEngine": 6.8,
        "ccScore": 8.1,
        "ccTier": "Quality",
        "ccYearsConsistent": 4,
        "megatrendTag": "AI/Cloud Infrastructure",
        "megatrendEmoji": "☁️",
        "fundamentals": {
          "fcfYield": 2.45,
          "earningsQuality": 8.9,
          "pegRatio": 2.1,
          "deDirection": "Improving",
          "marginDirection": "Expanding",
          "revenueCagr": 12.5,
          "yearsChecked": 5
        },
        "reasons": [
          "Strong solvency metrics (L1: 92)",
          "Excellent pricing power in cloud services",
          "Consistent dividend growth",
          "AI investment thesis with runway",
          "Quality earnings backed by FCF"
        ]
      },
      {
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "market": "US",
        "sector": "Technology",
        "price": 875.30,
        "marketCap": 2150000000000,
        "totalScore": 85.1,
        "scoreBreakdown": {
          "l1_score": 88,
          "l1_name": "Solvency",
          "l2_score": 90,
          "l2_name": "Pricing Power",
          "l3_score": 92,
          "l3_name": "Relative Strength",
          "l4_score": 86,
          "l4_name": "Growth",
          "l5_score": 82,
          "l5_name": "Governance",
          "l6_score": 73,
          "l6_name": "Valuation"
        },
        "mbScore": 7.9,
        "mbTier": "Strong",
        "mbRunway": 8.2,
        "mbCompoundingEngine": 9.5,
        "ccScore": 7.4,
        "ccTier": "Quality",
        "ccYearsConsistent": 3,
        "megatrendTag": "AI Acceleration",
        "megatrendEmoji": "🚀",
        "fundamentals": {
          "fcfYield": 1.85,
          "earningsQuality": 8.5,
          "pegRatio": 3.2,
          "deDirection": "Stable",
          "marginDirection": "Expanding",
          "revenueCagr": 45.2,
          "yearsChecked": 5
        },
        "reasons": [
          "Dominant AI hardware position",
          "Exceptional relative strength (L3: 92)",
          "High growth trajectory (45% CAGR)",
          "Strong pricing power in GPUs",
          "Premium valuation justified by growth"
        ]
      }
    ],
    "pagination": {
      "limit": 30,
      "offset": 0,
      "total": 346,
      "hasMore": true
    },
    "metadata": {
      "lastScanTime": "2026-05-03T09:31:45Z",
      "lastScanDuration": "45.2 seconds",
      "candidatesScanned": 500,
      "candidatesPassed": 346,
      "scanStatus": "COMPLETED"
    }
  }
}
```

**Response (Error 400):**
```json
{
  "success": false,
  "error": "Invalid market parameter. Must be 'US', 'NSE', or 'ALL'",
  "errorCode": "VALIDATION_ERROR"
}
```

**Example Queries:**

```bash
# Top 30 US stocks
curl "https://fortressintelligence.space/api/stocks/screen?market=US"

# Top 50 NSE stocks, sorted by Multi-Bagger score
curl "https://fortressintelligence.space/api/stocks/screen?market=NSE&limit=50&sortBy=mb_score"

# Technology sector only, minimum score 75
curl "https://fortressintelligence.space/api/stocks/screen?market=US&sector=Technology&minScore=75"

# Pagination: next 30 results
curl "https://fortressintelligence.space/api/stocks/screen?market=US&limit=30&offset=30"
```

---

### 3. GET /api/market/scan

Triggers a manual market scan or returns the current scan status.

**Purpose:** Administrative endpoint. Allows manual triggering of market scans outside of scheduled cron jobs and retrieves scan history.

**URL:** `https://fortressintelligence.space/api/market/scan`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| market | string | Yes | - | 'US' \| 'NSE' |
| action | string | No | 'status' | 'status' \| 'trigger' |

**Response - Status Check (action=status):**
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "scanId": "550e8400-e29b-41d4-a716-446655440000",
        "market": "US",
        "status": "COMPLETED",
        "startedAt": "2026-05-03T14:30:00Z",
        "completedAt": "2026-05-03T14:31:45Z",
        "durationMs": 105000,
        "candidatesScanned": 500,
        "candidatesPassed": 346
      },
      {
        "scanId": "550e8400-e29b-41d4-a716-446655440001",
        "market": "US",
        "status": "COMPLETED",
        "startedAt": "2026-05-02T14:30:00Z",
        "completedAt": "2026-05-02T14:31:30Z",
        "durationMs": 90000,
        "candidatesScanned": 500,
        "candidatesPassed": 346
      }
    ],
    "latestScan": {
      "scanId": "550e8400-e29b-41d4-a716-446655440000",
      "market": "US",
      "status": "COMPLETED",
      "startedAt": "2026-05-03T14:30:00Z",
      "completedAt": "2026-05-03T14:31:45Z",
      "durationMs": 105000
    }
  }
}
```

**Response - Trigger Scan (action=trigger):**
```json
{
  "success": true,
  "data": {
    "scanId": "550e8400-e29b-41d4-a716-446655440002",
    "market": "NSE",
    "status": "RUNNING",
    "startedAt": "2026-05-03T15:45:22Z",
    "estimatedDurationSeconds": 120,
    "message": "Scan initiated. Check status with ?action=status"
  }
}
```

**Response (Error - Market not provided):**
```json
{
  "success": false,
  "error": "Market parameter is required. Must be 'US' or 'NSE'",
  "errorCode": "VALIDATION_ERROR"
}
```

**Response (Error - Scan already running):**
```json
{
  "success": false,
  "error": "A scan for market 'NSE' is already running. Started at 2026-05-03T15:30:00Z",
  "errorCode": "CONFLICT_ERROR"
}
```

**Example Usage:**

```bash
# Check NSE scan status
curl "https://fortressintelligence.space/api/market/scan?market=NSE&action=status"

# Trigger US market scan
curl "https://fortressintelligence.space/api/market/scan?market=US&action=trigger"

# Poll scan status after trigger
curl "https://fortressintelligence.space/api/market/scan?market=US&action=status"
```

---

## Rate Limiting

**Current Policy:** No rate limiting (during beta)

*Note: Rate limiting (100 requests/minute per IP) will be implemented before public launch.*

---

## Error Codes Reference

| Error Code | HTTP Status | Meaning |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Invalid request parameters |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT_ERROR | 409 | Conflict (e.g., scan already running) |
| DATABASE_ERROR | 500 | Database operation failed |
| SERVER_ERROR | 500 | Unexpected server error |

---

## Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Request successful |
| 400 | Bad request (validation error) |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

---

## Examples by Use Case

### Use Case 1: Generate Portfolio for New User

```bash
# Step 1: Send user profile
curl -X POST https://fortressintelligence.space/api/allocation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 42,
    "investmentAmount": 50000,
    "timeHorizonYears": 15,
    "riskAppetite": "moderate",
    "selectedMarkets": ["US"]
  }'

# Response contains allocation with specific stock picks
# User can review allocation and confirm
```

### Use Case 2: Browse Top Stocks by Market

```bash
# Step 1: Get top 30 US stocks
curl "https://fortressintelligence.space/api/stocks/screen?market=US&limit=30"

# Step 2: Get top 20 NSE stocks
curl "https://fortressintelligence.space/api/stocks/screen?market=NSE&limit=20"

# User can browse results, click on stocks to see details
```

### Use Case 3: Monitor Scan Progress (Admin)

```bash
# Step 1: Trigger scan
curl "https://fortressintelligence.space/api/market/scan?market=NSE&action=trigger"

# Step 2: Poll status every 10 seconds
for i in {1..20}; do
  curl "https://fortressintelligence.space/api/market/scan?market=NSE&action=status"
  sleep 10
done

# Step 3: Once status is COMPLETED, results available in stock screening
```

---

## WebSocket/Real-Time (Planned)

Future versions will support WebSocket connections for:
- Real-time scan progress updates
- Live stock price updates
- Portfolio allocation changes

API not yet available.

---

## Versioning

Current API version: **1.0**

Breaking changes will increment major version (2.0, 3.0, etc).  
New endpoints or backwards-compatible changes will increment minor version.

---

## Further Reading
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — VPS operations
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) — Local environment
- [ROADMAP.md](ROADMAP.md) — Feature timeline
