# Testing Guide - PromQL Generation Fixes

## Quick Start

### 1. Start Your Services

If using Docker (recommended):
```bash
docker-compose up -d
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Run Automated Tests

```bash
node test-promql-generation.js
```

This will test all the demo queries and validate the generated PromQL syntax.

### 3. Manual Testing via Web Interface

1. Open your browser to `http://localhost:5173` (or configured port)

2. Test the **Quick Demo Queries** buttons:
   - ✅ CPU Usage (15 min)
   - ✅ Memory Usage (1 hour)
   - ✅ Network Traffic
   - ✅ Disk I/O (30 min)

3. Each should now:
   - Generate valid PromQL syntax (no parse errors)
   - Display results or show meaningful error messages
   - Not show "unexpected <by>" or "binary expression" errors

### 4. Test Custom Queries

Try these natural language queries in the input field:

**Simple Queries:**
- "CPU usage"
- "Memory available"
- "Network bandwidth"
- "Disk read rate"

**Time-Based Queries:**
- "CPU usage for last 30 minutes"
- "Memory usage for last 2 hours"
- "Disk I/O for last hour"

**Aggregation Queries:**
- "Average CPU by core"
- "Total network traffic"
- "Maximum memory usage"
- "CPU usage by core for last 15 minutes"

**Complex Queries:**
- "Network traffic by interface for last hour"
- "Disk read and write operations"
- "Average CPU usage across all cores"

## What to Look For

### ✅ Success Indicators

1. **Valid PromQL Generated:**
   - Queries appear in the "Generated PromQL Query" section
   - No syntax errors shown
   - Query executes against Prometheus

2. **Correct Syntax Patterns:**
   - Aggregations: `sum(rate(metric[5m])) by (label)`
   - Rate functions: `rate(metric[5m])` (brackets around time)
   - By clauses: `by (label)` or `avg by (label) (expression)`

3. **Better Error Messages:**
   - If errors occur, they're descriptive
   - "Invalid PromQL syntax: ..." (not just generic errors)
   - Context about what's wrong

### ❌ Issues to Report

If you still see:
- "parse error: unexpected <by>"
- "binary expression must contain only scalar and instant vector types"
- Queries without proper parentheses
- Incorrect placement of `by` clauses

**Then:**
1. Check backend logs: `docker-compose logs backend`
2. Look for validation messages
3. Note which query failed and what was generated

## Expected Results

### Example Successful Conversions

| Natural Language | Expected PromQL |
|-----------------|-----------------|
| "CPU usage for last 15 minutes" | `rate(windows_cpu_time_total[15m]) * 100` |
| "Memory usage for last hour" | `windows_cs_physical_memory_bytes - windows_memory_available_bytes` |
| "Network traffic by interface" | `rate(windows_net_bytes_total[5m]) by (nic)` |
| "Disk I/O rate for last 30 minutes" | `rate(windows_logical_disk_read_bytes_total[30m]) + rate(windows_logical_disk_write_bytes_total[30m])` |
| "Average CPU by core" | `avg by (core) (rate(windows_cpu_time_total[5m]) * 100)` |

### Common Variations

The AI might generate slightly different but still valid queries:
- Using different time ranges
- Different label names (check what your exporter uses)
- Additional calculations or transformations

**As long as:**
- No syntax errors occur
- Prometheus accepts the query
- Results are displayed (or empty if no data)

**Then it's working correctly! ✅**

## Troubleshooting

### Issue: "Backend is not available"
```bash
# Check if backend is running
docker ps
# or
curl http://localhost:4000/api/health
```

**Fix:** Start the backend service

### Issue: "Gemini is not configured"
```bash
# Check environment variable
echo $GEMINI_API_KEY
```

**Fix:** Set your API key:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

Or add to `.env` file in backend directory:
```
GEMINI_API_KEY=your-api-key-here
```

### Issue: Syntax errors still occurring

1. **Check you deployed the latest code:**
   ```bash
   # If using Docker
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Check backend logs:**
   ```bash
   docker-compose logs backend -f
   ```

   Look for:
   - "Converting NL to PromQL" - AI is being called
   - "PromQL validation failed" - Validation caught an error
   - "Successfully generated PromQL" - Query is valid

3. **Verify changes were applied:**
   ```bash
   # Check prompts.js has new content
   cat backend/src/config/prompts.js | grep "CRITICAL PROMQL SYNTAX RULES"
   
   # Should show: "CRITICAL PROMQL SYNTAX RULES:"
   ```

### Issue: Empty results but no errors

This is **not a bug** - it means:
- PromQL syntax is valid ✅
- Prometheus accepted the query ✅
- No data available for that metric ⚠️

**Check:**
1. Windows Exporter is running
2. Prometheus is scraping metrics
3. Open Prometheus UI: `http://localhost:9090`
4. Try query manually: `windows_cpu_time_total`

### Issue: Different query than expected

The AI might generate variations that are still correct:
- Different metric names (if multiple are available)
- Different aggregations
- Additional calculations

**As long as:**
- No syntax errors ✅
- Query executes ✅
- Results make sense ✅

**Then it's working as intended!**

## Performance Check

With the fixes, you should see:

**Before Fixes:**
- ❌ Frequent syntax errors
- ❌ "unexpected <by>" errors
- ❌ Invalid queries reaching Prometheus
- ❌ Generic error messages

**After Fixes:**
- ✅ Valid PromQL syntax generated
- ✅ Automatic retry if validation fails
- ✅ Better error messages
- ✅ Pre-validation before Prometheus
- ✅ ~80%+ success rate on natural language queries

## Advanced Testing

### Test with Prometheus Directly

You can verify generated queries work in Prometheus:

1. Get a generated query from your app
2. Open Prometheus UI: `http://localhost:9090`
3. Paste the query in the expression browser
4. Click "Execute"

If it works there, your PromQL is valid! ✅

### Check AI Model Fallback

The system tries multiple AI models if one fails:

1. Check backend logs while testing
2. Look for: "Converting NL to PromQL" with "attempt: 1, 2, 3..."
3. If validation fails, should see: "PromQL validation failed, retrying..."
4. Success shows: "Successfully generated PromQL" with model name

### Load Testing

Test with many queries rapidly:
```bash
# Run test suite multiple times
for i in {1..5}; do
  echo "Run $i"
  node test-promql-generation.js
done
```

Should maintain high success rate across runs.

## Success Criteria

The fix is working correctly if:

✅ All demo queries work without syntax errors  
✅ Custom natural language queries generate valid PromQL  
✅ Error messages are clear and helpful  
✅ System retries with different AI models if needed  
✅ Validation catches errors before reaching Prometheus  
✅ ~80%+ of reasonable queries succeed  

## Getting Help

If issues persist:

1. **Collect Information:**
   - Natural language query that failed
   - Generated PromQL (if any)
   - Error message shown
   - Backend logs

2. **Check Documentation:**
   - `PROMQL_GENERATION_FIX.md` - Detailed fix explanation
   - Prometheus PromQL documentation
   - Windows Exporter metrics list

3. **Debug Steps:**
   - Test query directly in Prometheus
   - Check if metrics exist
   - Verify services are healthy
   - Review backend logs for validation messages

---

**Ready to Test?** 🚀

Run: `node test-promql-generation.js`

Good luck! 🎉

