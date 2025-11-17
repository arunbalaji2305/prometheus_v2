# Acceptance Tests

This document provides manual and API acceptance tests to verify the Natural Language to PromQL system is working correctly.

## Test Environment Setup

Before running tests, ensure:

1. ✅ Windows Exporter running on port 9182
2. ✅ Prometheus running on port 9090 and scraping Windows Exporter
3. ✅ Backend API running on port 4000
4. ✅ Frontend running on port 5173 (dev) or port 80 (Docker)
5. ✅ Valid Gemini API key configured

### Verification Commands

```powershell
# Check Windows Exporter
curl http://localhost:9182/metrics

# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Backend
curl http://localhost:4000/api/health

# Check Frontend (open in browser)
start http://localhost:5173
```

---

## Test Suite 1: Backend API Tests

### Test 1.1: Health Check Endpoint

**Endpoint**: `GET /api/health`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "timestamp": "2024-11-09T12:00:00.000Z",
    "services": {
      "prometheusUp": true,
      "aiConfigured": true
    }
  }
}
```

**Test Steps**:
```powershell
# PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET
$response | ConvertTo-Json -Depth 3

# cURL
curl http://localhost:4000/api/health
```

**Pass Criteria**:
- ✅ Status code 200
- ✅ `ok` is `true`
- ✅ `prometheusUp` is `true`
- ✅ `aiConfigured` is `true`

**Failure Scenarios**:

| Scenario | Expected Result | Status Code |
|----------|----------------|-------------|
| Prometheus down | `prometheusUp: false`, `ok: false` | 503 |
| Invalid API key | `aiConfigured: false`, `ok: false` | 503 |

---

### Test 1.2: Natural Language to PromQL Conversion

**Endpoint**: `POST /api/nl2promql`

**Test Case A: Basic CPU Query**

**Request**:
```json
{
  "query": "CPU usage for the last 15 minutes"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "naturalLanguageQuery": "CPU usage for the last 15 minutes",
    "promqlQuery": "rate(windows_cpu_time_total[15m]) * 100"
  }
}
```

**Test Steps**:
```powershell
# PowerShell
$body = @{
    query = "CPU usage for the last 15 minutes"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/nl2promql" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 3

# cURL
curl -X POST http://localhost:4000/api/nl2promql \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"CPU usage for the last 15 minutes\"}"
```

**Pass Criteria**:
- ✅ Status code 200
- ✅ Returns valid PromQL query (single line, no markdown)
- ✅ PromQL includes `rate(windows_cpu_time_total[15m])`
- ✅ Response time < 5 seconds

**Test Case B: Memory Query**

**Request**:
```json
{
  "query": "Show available memory in gigabytes"
}
```

**Expected PromQL** (example):
```promql
windows_memory_available_bytes / 1024 / 1024 / 1024
```

**Test Case C: Network Traffic Query**

**Request**:
```json
{
  "query": "Network traffic by interface for last 30 minutes"
}
```

**Expected PromQL** (example):
```promql
rate(windows_net_bytes_total[30m]) by (nic)
```

**Failure Scenarios**:

| Scenario | Request | Expected Status | Error Message |
|----------|---------|----------------|---------------|
| Empty query | `{"query": ""}` | 400 | Validation failed |
| Very short query | `{"query": "ab"}` | 400 | Query must be at least 3 characters |
| Too long query | 501+ characters | 400 | Query must not exceed 500 characters |
| Missing query field | `{}` | 400 | Validation failed |
| Invalid API key | Valid request | 401 | Invalid Gemini API key |

---

### Test 1.3: Prometheus Query Range

**Endpoint**: `GET /api/prometheus/query_range`

**Test Case: Query CPU Data**

**Request Parameters**:
```
query: rate(windows_cpu_time_total[5m])
start: 1699564800  (Unix timestamp - 15 mins ago)
end: 1699565400    (Unix timestamp - now)
step: 15s
```

**Test Steps**:
```powershell
# Calculate timestamps (PowerShell)
$endTime = [int][double]::Parse((Get-Date -UFormat %s))
$startTime = $endTime - 900  # 15 minutes ago

$params = @{
    query = "rate(windows_cpu_time_total[5m])"
    start = $startTime
    end = $endTime
    step = "15s"
}

$uri = "http://localhost:4000/api/prometheus/query_range?" + (($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&")

$response = Invoke-RestMethod -Uri $uri -Method GET
$response | ConvertTo-Json -Depth 5

# cURL (calculate timestamps first)
curl "http://localhost:4000/api/prometheus/query_range?query=rate(windows_cpu_time_total[5m])&start=1699564800&end=1699565400&step=15s"
```

**Expected Response Structure**:
```json
{
  "success": true,
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": {
          "__name__": "windows_cpu_time_total",
          "core": "0",
          ...
        },
        "values": [
          [1699564800, "0.123"],
          [1699564815, "0.125"],
          ...
        ]
      }
    ]
  }
}
```

**Pass Criteria**:
- ✅ Status code 200
- ✅ `resultType` is `"matrix"`
- ✅ `result` array contains time series data
- ✅ Each result has `metric` and `values` arrays
- ✅ Timestamps are within requested range

**Failure Scenarios**:

| Scenario | Expected Status | Error |
|----------|----------------|-------|
| Invalid PromQL | 400 or 500 | Prometheus error message |
| Missing required param | 400 | Validation failed |
| Invalid timestamp | 400 | Invalid timestamp |
| Prometheus down | 500 | Failed to query Prometheus |

---

## Test Suite 2: Frontend UI Tests

### Test 2.1: Page Load and Health Status

**Test Steps**:
1. Open browser to `http://localhost:5173` (or `http://localhost`)
2. Observe health status banner at top

**Pass Criteria**:
- ✅ Page loads without errors
- ✅ Header displays "Natural Language to PromQL"
- ✅ Health status shows "All Systems Operational" (green)
- ✅ Health indicators show Prometheus UP and Gemini AI configured

---

### Test 2.2: Natural Language Query Flow

**Test Case A: Submit CPU Query**

**Test Steps**:
1. Enter query: "CPU usage for the last 15 minutes"
2. Set lookback: `15` minutes
3. Set step: `15s`
4. Click "Convert & Visualize"

**Expected Behavior**:
- ✅ Button shows loading spinner
- ✅ After 2-5 seconds, results appear
- ✅ PromQL query displayed in code block (e.g., `rate(windows_cpu_time_total[15m]) * 100`)
- ✅ Copy button appears next to PromQL
- ✅ KPI metrics cards show: Current, Average, Maximum, Minimum
- ✅ Line chart renders with time on X-axis and metric values on Y-axis
- ✅ Chart shows multiple lines (one per CPU core)
- ✅ Tooltip appears on hover over chart

**Test Case B: Try Demo Queries**

**Test Steps**:
1. Click "CPU Usage (15 min)" demo button
2. Wait for results

**Expected Behavior**:
- ✅ Query input auto-fills
- ✅ Query auto-submits
- ✅ Results appear as in Test Case A

**Test Case C: Copy PromQL Query**

**Test Steps**:
1. After query results appear, click "Copy" button
2. Paste into text editor or Prometheus UI

**Expected Behavior**:
- ✅ Button changes to "Copied!" with checkmark
- ✅ Clipboard contains valid PromQL query
- ✅ Button reverts to "Copy" after 2 seconds

---

### Test 2.3: Error Handling

**Test Case A: Empty Query**

**Test Steps**:
1. Leave query field empty
2. Click "Convert & Visualize"

**Expected Behavior**:
- ✅ Button is disabled (cannot click)

**Test Case B: Backend Unavailable**

**Test Steps**:
1. Stop backend server
2. Submit a query

**Expected Behavior**:
- ✅ Red error alert appears
- ✅ Error message: "Cannot connect to backend. Please ensure the server is running on port 4000."
- ✅ No results displayed
- ✅ Can dismiss error with X button

**Test Case C: Invalid PromQL Generated**

**Test Steps**:
1. Enter complex/ambiguous query
2. Submit

**Expected Behavior**:
- ✅ If Prometheus rejects query, error alert shows Prometheus error message
- ✅ User can modify query and retry

---

### Test 2.4: Grafana Integration (Optional)

**Prerequisites**:
- `VITE_GRAFANA_BASE_URL` set in frontend `.env`
- Grafana running on port 3000

**Test Steps**:
1. Submit a query and view results
2. Look for "Open in Grafana" button
3. Click the button

**Expected Behavior**:
- ✅ "Open in Grafana" button appears (orange color)
- ✅ Clicking opens new browser tab
- ✅ Grafana Explore view loads
- ✅ PromQL query is pre-filled
- ✅ Time range matches the lookback period
- ✅ Tooltip explains the feature

**If Grafana Not Configured**:
- ✅ Button does NOT appear
- ✅ No errors related to Grafana

---

## Test Suite 3: Integration Tests

### Test 3.1: End-to-End User Flow

**Scenario**: A user wants to monitor CPU usage.

**Test Steps**:
1. Open frontend
2. Verify health status is green
3. Enter "Show CPU usage for last 10 minutes"
4. Set lookback to 10 minutes
5. Click "Convert & Visualize"
6. Wait for results
7. Examine PromQL query
8. Copy PromQL query
9. Paste into Prometheus UI directly
10. Verify same results

**Pass Criteria**:
- ✅ Each step completes successfully
- ✅ Results in app match Prometheus UI
- ✅ No errors or warnings in browser console

---

### Test 3.2: Multiple Query Types

**Test each demo query**:

| Query | Expected Metric | Expected Function |
|-------|----------------|-------------------|
| CPU Usage (15 min) | `windows_cpu_time_total` | `rate()` |
| Memory Usage (1 hour) | `windows_memory_available_bytes` | May include division |
| Network Traffic | `windows_net_bytes_total` | `rate()` with `by (nic)` |
| Disk I/O (30 min) | `windows_logical_disk_*` | `rate()` |

**Pass Criteria**:
- ✅ All 4 demo queries return valid results
- ✅ Charts render correctly
- ✅ KPIs calculated accurately

---

### Test 3.3: Stress Test

**Test**: Submit 10 queries in rapid succession

**Expected Behavior**:
- ✅ Rate limiting kicks in after ~10 requests (429 status)
- ✅ Error message: "Too many requests, please try again later."
- ✅ After 15 minutes, can query again

---

## Test Suite 4: Data Validation

### Test 4.1: Verify Metric Accuracy

**Test Steps**:
1. Query "Current CPU usage"
2. Note the "Current" KPI value
3. Open Task Manager → Performance → CPU
4. Compare values

**Pass Criteria**:
- ✅ Values are within ±5% of each other

---

### Test 4.2: Time Range Accuracy

**Test Steps**:
1. Query with 5-minute lookback
2. Check chart X-axis labels
3. Verify time span is exactly 5 minutes

**Pass Criteria**:
- ✅ First and last data points are ~5 minutes apart

---

## Test Suite 5: Security Tests

### Test 5.1: API Key Protection

**Test**: Check logs for exposed API keys

**Test Steps**:
1. Submit a query
2. Check backend logs

**Pass Criteria**:
- ✅ Gemini API key NEVER appears in logs
- ✅ Logs show `[Redacted]` or omit sensitive data

---

### Test 5.2: CORS Validation

**Test**: Call API from unauthorized origin

**Test Steps**:
1. Open browser console on `http://example.com`
2. Attempt to fetch backend API:
   ```javascript
   fetch('http://localhost:4000/api/health')
   ```

**Expected Behavior**:
- ✅ CORS error if origin not in allowed list
- ✅ In development, localhost origins should be allowed

---

### Test 5.3: Input Sanitization

**Test**: Submit malicious input

**Test Cases**:
```json
{"query": "<script>alert('XSS')</script>"}
{"query": "'; DROP TABLE metrics; --"}
{"query": "../../etc/passwd"}
```

**Expected Behavior**:
- ✅ No script execution
- ✅ No SQL injection (not applicable, but validation still works)
- ✅ Path traversal blocked
- ✅ Sanitized query sent to Gemini

---

## Test Suite 6: Browser Compatibility

Test frontend on:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

**Verify**:
- ✅ UI renders correctly
- ✅ Charts display properly
- ✅ All interactive features work
- ✅ No console errors

---

## Test Suite 7: Responsive Design

**Test on different screen sizes**:

| Device | Resolution | Test |
|--------|-----------|------|
| Desktop | 1920x1080 | Full layout |
| Laptop | 1366x768 | Cards adjust |
| Tablet | 768x1024 | Stack vertically |
| Mobile | 375x667 | Single column |

**Pass Criteria**:
- ✅ No horizontal scrolling
- ✅ Text readable
- ✅ Buttons accessible
- ✅ Charts resize appropriately

---

## Automated Testing (Future)

For CI/CD, consider adding:

### Backend Unit Tests
```javascript
// backend/test/nl2promql.test.js
describe('NL2PromQL Endpoint', () => {
  it('should convert CPU query', async () => {
    const response = await request(app)
      .post('/api/nl2promql')
      .send({ query: 'CPU usage' });
    expect(response.status).toBe(200);
    expect(response.body.data.promqlQuery).toContain('cpu');
  });
});
```

### Frontend E2E Tests
```javascript
// frontend/cypress/e2e/query-flow.cy.js
describe('Query Flow', () => {
  it('should submit query and show results', () => {
    cy.visit('/');
    cy.get('input[placeholder*="CPU"]').type('CPU usage');
    cy.contains('Convert & Visualize').click();
    cy.contains('rate(windows_cpu_time_total', { timeout: 10000 });
    cy.get('canvas').should('be.visible'); // Chart
  });
});
```

---

## Test Checklist

Before releasing, ensure all tests pass:

- [ ] Backend health endpoint returns 200
- [ ] NL to PromQL conversion works for all demo queries
- [ ] Prometheus query_range returns data
- [ ] Frontend loads without errors
- [ ] All 4 demo queries work end-to-end
- [ ] Copy PromQL button works
- [ ] KPI metrics calculate correctly
- [ ] Chart renders with correct data
- [ ] Error handling works (backend down, invalid query)
- [ ] Grafana button appears (if configured) and works
- [ ] No API keys in logs
- [ ] CORS configured correctly
- [ ] Rate limiting prevents abuse
- [ ] Works on Chrome, Firefox, Safari
- [ ] Responsive on mobile devices

---

## Reporting Issues

When a test fails, document:

1. **Test ID**: (e.g., Test 2.2A)
2. **Expected**: What should happen
3. **Actual**: What actually happened
4. **Steps to Reproduce**: Detailed steps
5. **Environment**: Browser, OS, versions
6. **Logs**: Backend logs, browser console errors
7. **Screenshots**: Visual evidence

---

## Continuous Monitoring

For production, set up:

- **Health Check Monitoring**: Ping `/api/health` every 5 minutes
- **Uptime Monitoring**: Services like UptimeRobot
- **Error Tracking**: Sentry or similar for frontend/backend errors
- **Performance Monitoring**: Track API response times
- **Log Aggregation**: Centralized logging (ELK stack, Datadog)

---

## Conclusion

This acceptance test suite ensures the Natural Language to PromQL system works reliably across all components. Run these tests:

- ✅ Before each release
- ✅ After dependency updates
- ✅ When adding new features
- ✅ In CI/CD pipeline

Regular testing maintains quality and prevents regressions.

