# PromQL Generation Fix Summary

## Issues Identified

Based on the error screenshots provided, the Natural Language to PromQL conversion was generating syntactically invalid PromQL queries:

1. **Error 1**: `parse error: binary expression must contain only scalar and instant vector types`
   - This occurs when incompatible types are used in operations
   
2. **Error 2**: `parse error: unexpected <by>`
   - This occurs when the `by` clause is incorrectly placed in the query

## Root Cause

The Gemini AI was generating PromQL queries with incorrect syntax, specifically:
- Improper placement of aggregation operators
- Incorrect use of `by` clauses
- Missing parentheses around aggregation functions
- Invalid type operations

## Fixes Implemented

### 1. Enhanced Prompt Engineering (`backend/src/config/prompts.js`)

**Improvements:**
- Added detailed PromQL syntax rules with correct/incorrect examples
- Emphasized critical syntax patterns for:
  - Aggregation operators (sum, avg, max, min, count)
  - Correct placement of `by` and `without` clauses
  - Proper use of rate() and irate() functions
  - Binary operations type compatibility
  - Parentheses requirements
- Added more comprehensive examples covering common queries
- Included specific Windows metrics reference
- Added explicit reminders about syntax validation

**Key additions:**
```
CRITICAL PROMQL SYNTAX RULES:
1. AGGREGATION OPERATORS: When using sum, avg, max, min, count, etc., the syntax MUST be:
   - CORRECT: sum(rate(metric[5m])) by (label)
   - CORRECT: avg by (label) (rate(metric[5m]))
   - WRONG: rate(metric[5m]) by (label) sum

2. BY/WITHOUT CLAUSES: Place immediately after aggregation operator OR after the vector selector
   - CORRECT: sum by (label) (metric)
   - CORRECT: sum(metric) by (label)
   - WRONG: metric by (label) without grouping
```

### 2. Added PromQL Validation (`backend/src/services/gemini.service.js`)

**New validation function:**
- `validateAndSanitizePromQL()` - Validates generated queries before returning

**Validation checks:**
- Detects common syntax errors (incorrect `by` placement, missing parentheses)
- Validates balanced parentheses and brackets
- Removes quotes if AI accidentally added them
- Ensures query contains valid metric names or functions
- Automatically retries with next AI model if validation fails

**Pattern detection for common errors:**
```javascript
const invalidPatterns = [
  { pattern: /\bby\b\s*\[/, error: 'Invalid syntax: "by" should not be followed by square brackets...' },
  { pattern: /rate\([^)]+\)\s+by\s+[^\(]/, error: 'Invalid syntax: "by" clause must be part of aggregation...' },
  // ... more patterns
];
```

### 3. Improved Error Handling (`backend/src/services/prometheus.service.js`)

**Enhanced error messages:**
- Parse JSON error responses from Prometheus
- Provide context-specific error messages
- Detect and explain common error types:
  - Parse errors → "Invalid PromQL syntax"
  - Binary expression errors → "PromQL type error: Check that operations are between compatible types"
  - Unexpected token errors → "PromQL syntax error: Check query structure and operators"

### 4. Retry Logic Enhancement

**Multi-model fallback with validation:**
- If generated query fails validation, automatically tries next AI model
- Logs validation failures with detailed context
- Continues through model list until valid query is generated
- Prevents invalid queries from reaching Prometheus

## How to Test

### Prerequisites
Ensure your services are running:
```bash
docker-compose up -d
```

### Test Cases

#### 1. CPU Usage Query
**Input:** "Show CPU usage for the last 15 minutes"  
**Expected PromQL:** `rate(windows_cpu_time_total[15m]) * 100`

#### 2. Memory Usage Query
**Input:** "Memory usage for last hour"  
**Expected PromQL:** `windows_cs_physical_memory_bytes - windows_memory_available_bytes`

#### 3. Network Traffic Query
**Input:** "Network traffic by interface"  
**Expected PromQL:** `rate(windows_net_bytes_total[5m]) by (nic)`

#### 4. Disk I/O Query
**Input:** "Disk I/O rate for last 30 minutes"  
**Expected PromQL:** `rate(windows_logical_disk_read_bytes_total[30m]) + rate(windows_logical_disk_write_bytes_total[30m])`

### Testing Steps

1. **Start the application:**
   ```bash
   # Make sure Docker is running
   docker-compose up -d
   
   # Or start services individually
   cd backend && npm start
   cd frontend && npm run dev
   ```

2. **Access the web interface:**
   - Open browser to `http://localhost:5173` (or your configured port)

3. **Test Demo Queries:**
   - Click each of the "Quick Demo Queries" buttons
   - Verify they generate valid PromQL and display results
   - Check that no syntax errors appear

4. **Test Custom Queries:**
   Try various natural language queries:
   - "Average CPU usage"
   - "Memory available in GB"
   - "Network bandwidth by interface for last 30 minutes"
   - "Total disk read and write operations"

5. **Check Error Handling:**
   - If any errors occur, they should now be more descriptive
   - The system should automatically retry with different AI models
   - Validation errors should be caught before reaching Prometheus

## Expected Improvements

After these fixes:

✅ **Valid PromQL Generation**: AI generates syntactically correct queries  
✅ **Better Error Messages**: Clear, actionable error messages when issues occur  
✅ **Automatic Retry**: Failed validations trigger automatic retry with next AI model  
✅ **Pre-validation**: Invalid queries caught before sending to Prometheus  
✅ **Robust Parsing**: Better handling of AI response formatting variations  

## Monitoring & Debugging

To debug issues, check backend logs:
```bash
# If using Docker
docker-compose logs backend

# Or check the console output if running locally
```

Look for:
- `Converting NL to PromQL` - Shows which AI model is being used
- `PromQL validation failed` - Shows validation errors and retry attempts
- `Successfully generated PromQL` - Confirms valid query generation
- `Prometheus query failed` - Shows Prometheus-level errors

## Configuration

The system tries multiple AI models in order:
1. `gemini-2.5-flash`
2. `gemini-2.5-flash-preview-05-20`
3. `gemini-2.5-pro`
4. `gemini-flash-latest`
5. `gemini-pro-latest`

If one model generates invalid syntax, it automatically tries the next.

## Common Issues & Solutions

### Issue: Still getting syntax errors
**Solution:** 
- Check backend logs for validation messages
- Ensure all code changes are deployed
- Restart backend service: `docker-compose restart backend`

### Issue: AI returning formatted text instead of PromQL
**Solution:** 
- The new prompt explicitly forbids this
- Validation now strips markdown formatting
- If persistent, check `GEMINI_API_KEY` is valid

### Issue: Queries work but results are empty
**Solution:** 
- This is not a syntax issue - Prometheus is responding correctly
- Check that Windows Exporter is running and collecting metrics
- Verify metrics exist: `http://localhost:9090/graph` → try `windows_cpu_time_total`

## Files Modified

1. `backend/src/config/prompts.js` - Enhanced prompt with syntax rules
2. `backend/src/services/gemini.service.js` - Added validation and retry logic
3. `backend/src/services/prometheus.service.js` - Improved error handling

## Next Steps

If issues persist after these fixes:
1. Check backend logs for specific validation failures
2. Test individual PromQL queries directly in Prometheus UI
3. Verify Gemini API key has sufficient quota
4. Consider adjusting validation patterns if false positives occur

## Technical Details

### Validation Regex Patterns

The validation uses regex to detect common PromQL syntax errors:

```javascript
// Detect "by" followed by square brackets (wrong)
/\bby\b\s*\[/

// Detect rate() followed by "by" without aggregation (wrong)
/rate\([^)]+\)\s+by\s+[^\(]/

// Detect aggregation operator without proper parentheses (wrong)
/\b(sum|avg|min|max|count)\s+[^\(by]/
```

### Balanced Bracket Checking

Ensures parentheses `()` and brackets `[]` are properly balanced:

```javascript
let parenCount = 0, bracketCount = 0;
for (const char of promqlQuery) {
  if (char === '(') parenCount++;
  if (char === ')') parenCount--;
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
  if (parenCount < 0 || bracketCount < 0) throw new Error('Unbalanced');
}
```

---

**Fix Date:** November 10, 2025  
**Status:** ✅ Complete - Ready for testing

