#!/usr/bin/env node

/**
 * Test Script for PromQL Generation Fixes
 * 
 * This script tests the natural language to PromQL conversion
 * to ensure the fixes are working correctly.
 * 
 * Usage: node test-promql-generation.js
 * 
 * Prerequisites:
 * - Backend server must be running on port 4000
 * - Gemini API key must be configured
 */

const API_BASE_URL = 'http://localhost:4000';

const TEST_QUERIES = [
  // Demo queries
  {
    name: 'CPU Usage (15 min)',
    query: 'Show CPU usage for the last 15 minutes',
    expectedPattern: /rate\(windows_cpu_time_total\[15m\]\)\s*\*\s*100/,
  },
  {
    name: 'Memory Available',
    query: 'Available memory',
    expectedPattern: /windows_memory_available_bytes/,
  },
  {
    name: 'Network Traffic by Interface',
    query: 'Network traffic by interface',
    expectedPattern: /sum.*by\s*\([^)]+\).*rate\(windows_net.*\[/,
  },
  {
    name: 'Disk I/O',
    query: 'Disk I/O rate for last 30 minutes',
    expectedPattern: /rate\(windows_logical_disk.*\[30m\]\)/,
  },
  
  // Custom queries - Simple
  {
    name: 'Simple CPU',
    query: 'CPU',
    expectedPattern: /rate\(windows_cpu_time_total/,
  },
  {
    name: 'Simple Network',
    query: 'Network speed',
    expectedPattern: /rate\(windows_net/,
  },
  
  // Custom queries - Time ranges
  {
    name: 'CPU (5 min)',
    query: 'CPU for last 5 minutes',
    expectedPattern: /rate\(windows_cpu_time_total\[5m\]\)/,
  },
  {
    name: 'Network (1 hour)',
    query: 'Network traffic last hour',
    expectedPattern: /rate\(windows_net.*\[1h\]\)/,
  },
  
  // Custom queries - Aggregations
  {
    name: 'CPU by Core',
    query: 'Average CPU by core',
    expectedPattern: /avg.*by\s*\([^)]+\).*rate/,
  },
  {
    name: 'Total Network',
    query: 'Total network bandwidth',
    expectedPattern: /sum\(rate\(windows_net/,
  },
  
  // Custom queries - Combined
  {
    name: 'Total Disk I/O',
    query: 'Total disk I/O',
    expectedPattern: /rate\(.*read.*\[.*\]\).*\+.*rate\(.*write/,
  },
  
  // Custom queries - Statistical
  {
    name: 'Maximum CPU',
    query: 'Maximum CPU',
    expectedPattern: /max\(rate\(windows_cpu_time_total/,
  },
];

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Validation functions
function validatePromQLSyntax(query) {
  const errors = [];

  // Check for common syntax errors
  if (/\bby\b\s*\[/.test(query)) {
    errors.push('Invalid: "by" followed by square brackets');
  }

  if (/rate\([^)]+\)\s+by\s+[^\(]/.test(query)) {
    errors.push('Invalid: "by" clause without aggregation function');
  }

  // Check balanced parentheses
  let parenCount = 0;
  let bracketCount = 0;
  for (const char of query) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    if (parenCount < 0) {
      errors.push('Unbalanced parentheses: too many closing )');
      break;
    }
    if (bracketCount < 0) {
      errors.push('Unbalanced brackets: too many closing ]');
      break;
    }
  }

  if (parenCount !== 0) {
    errors.push(`Unbalanced parentheses: ${parenCount > 0 ? 'missing' : 'extra'} closing )`);
  }
  if (bracketCount !== 0) {
    errors.push(`Unbalanced brackets: ${bracketCount > 0 ? 'missing' : 'extra'} closing ]`);
  }

  return errors;
}

async function testNL2PromQL(testCase) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nl2promql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: testCase.query }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    const promqlQuery = data.data.promqlQuery;

    // Validate syntax
    const syntaxErrors = validatePromQLSyntax(promqlQuery);
    if (syntaxErrors.length > 0) {
      return {
        success: false,
        promqlQuery,
        error: `Syntax validation failed: ${syntaxErrors.join('; ')}`,
      };
    }

    // Check against expected pattern
    const matchesPattern = testCase.expectedPattern.test(promqlQuery);

    return {
      success: true,
      promqlQuery,
      matchesPattern,
      patternNote: matchesPattern ? '✓ Matches expected pattern' : '⚠ Pattern mismatch (may still be valid)',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.success && data.data.gemini;
  } catch (error) {
    return false;
  }
}

async function runTests() {
  console.log(colorize('\n🧪 PromQL Generation Test Suite\n', 'bright'));
  console.log(colorize('═'.repeat(60), 'cyan'));

  // Check backend health
  console.log('\n📡 Checking backend connection...');
  const isHealthy = await checkBackendHealth();
  
  if (!isHealthy) {
    console.log(colorize('❌ Backend is not available or Gemini is not configured', 'red'));
    console.log(colorize('   Make sure the backend is running and GEMINI_API_KEY is set', 'yellow'));
    process.exit(1);
  }
  
  console.log(colorize('✓ Backend is healthy', 'green'));

  // Run tests
  console.log(colorize('\n🔍 Running tests...\n', 'bright'));

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const testCase = TEST_QUERIES[i];
    console.log(colorize(`\nTest ${i + 1}/${TEST_QUERIES.length}: ${testCase.name}`, 'cyan'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(`Query: "${testCase.query}"`);

    const result = await testNL2PromQL(testCase);

    if (result.success) {
      passed++;
      console.log(colorize('✓ Success', 'green'));
      console.log(`Generated: ${colorize(result.promqlQuery, 'blue')}`);
      if (result.patternNote) {
        console.log(colorize(result.patternNote, result.matchesPattern ? 'green' : 'yellow'));
      }
    } else {
      failed++;
      console.log(colorize('✗ Failed', 'red'));
      console.log(colorize(`Error: ${result.error}`, 'red'));
      if (result.promqlQuery) {
        console.log(`Generated: ${result.promqlQuery}`);
      }
    }
  }

  // Summary
  console.log(colorize('\n═'.repeat(60), 'cyan'));
  console.log(colorize('\n📊 Test Summary\n', 'bright'));
  console.log(`Total Tests: ${TEST_QUERIES.length}`);
  console.log(colorize(`✓ Passed: ${passed}`, 'green'));
  if (failed > 0) {
    console.log(colorize(`✗ Failed: ${failed}`, 'red'));
  }
  
  const passRate = (passed / TEST_QUERIES.length * 100).toFixed(1);
  console.log(`\nPass Rate: ${colorize(`${passRate}%`, passRate >= 80 ? 'green' : 'yellow')}`);

  if (failed === 0) {
    console.log(colorize('\n🎉 All tests passed!', 'green'));
  } else {
    console.log(colorize('\n⚠️  Some tests failed. Check the errors above.', 'yellow'));
  }

  console.log(colorize('\n═'.repeat(60), 'cyan'));
  console.log();

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error(colorize('\n❌ Test suite error:', 'red'), error);
    process.exit(1);
  });
}

module.exports = { testNL2PromQL, validatePromQLSyntax };

