/**
 * PTE Academic Practice System - API Testing Script
 *
 * This script tests all API endpoints for the practice system.
 *
 * Usage: npx tsx scripts/test-all-apis.ts [--verbose] [--section=speaking|reading|writing|listening]
 *
 * Examples:
 *   npx tsx scripts/test-all-apis.ts                    # Test all sections
 *   npx tsx scripts/test-all-apis.ts --verbose          # Verbose output
 *   npx tsx scripts/test-all-apis.ts --section=speaking # Test speaking only
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const VERBOSE = process.argv.includes('--verbose')
const SECTION_ARG = process.argv.find((arg) => arg.startsWith('--section='))
const TARGET_SECTION = SECTION_ARG ? SECTION_ARG.split('=')[1] : null

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

interface TestResult {
  name: string
  section: string
  passed: boolean
  error?: string
  duration: number
  status?: number
}

const results: TestResult[] = []
let testCount = 0
let passCount = 0
let failCount = 0

// Session cookie for authenticated requests
let sessionCookie = ''

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logVerbose(message: string) {
  if (VERBOSE) {
    log(message, colors.gray)
  }
}

function logTest(name: string) {
  testCount++
  log(`\n[${testCount}] Testing: ${name}`, colors.cyan)
}

function logPass(message: string) {
  passCount++
  log(`✓ ${message}`, colors.green)
}

function logFail(message: string) {
  failCount++
  log(`✗ ${message}`, colors.red)
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow)
}

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: any; status: number; ok: boolean }> {
  const url = `${BASE_URL}${endpoint}`

  logVerbose(`Request: ${options.method || 'GET'} ${url}`)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }

  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const duration = Date.now() - startTime
    const data = await response.json().catch(() => null)

    logVerbose(`Response: ${response.status} (${duration}ms)`)
    if (VERBOSE && data) {
      logVerbose(`Data: ${JSON.stringify(data, null, 2)}`)
    }

    return {
      data,
      status: response.status,
      ok: response.ok,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    logVerbose(`Error: ${error}`)

    return {
      data: null,
      status: 0,
      ok: false,
    }
  }
}

async function testEndpoint(
  name: string,
  section: string,
  endpoint: string,
  options: RequestInit = {},
  expectedStatus: number = 200
): Promise<TestResult> {
  logTest(`${section.toUpperCase()}: ${name}`)

  const startTime = Date.now()
  const result = await fetchAPI(endpoint, options)
  const duration = Date.now() - startTime

  const passed = result.status === expectedStatus

  const testResult: TestResult = {
    name,
    section,
    passed,
    duration,
    status: result.status,
  }

  if (passed) {
    logPass(`${name} - Status: ${result.status} (${duration}ms)`)
  } else {
    testResult.error = `Expected ${expectedStatus}, got ${result.status}`
    logFail(`${name} - ${testResult.error} (${duration}ms)`)
  }

  results.push(testResult)
  return testResult
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function setupAuthentication() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('AUTHENTICATION SETUP', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // For testing purposes, we'll skip actual login
  // In production, you would:
  // 1. Make a POST to /api/auth/sign-in with credentials
  // 2. Extract the session cookie
  // 3. Use it for subsequent requests

  logWarning('Note: Authentication tests skipped')
  logWarning('Please ensure you have a valid session cookie for full testing')
  logWarning('Or modify this script to include your test credentials')

  // Uncomment and modify for actual authentication:
  /*
  const authResult = await fetchAPI('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
    }),
  });

  if (authResult.ok && authResult.data?.session) {
    sessionCookie = `better-auth.session_token=${authResult.data.session.token}`;
    logPass('Authentication successful');
  } else {
    logFail('Authentication failed');
  }
  */
}

// ============================================================================
// SPEAKING SECTION TESTS
// ============================================================================

async function testSpeakingEndpoints() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('SPEAKING SECTION TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: List speaking questions
  await testEndpoint(
    'List speaking questions (default pagination)',
    'speaking',
    '/api/speaking/questions'
  )

  // Test 2: List with pagination
  await testEndpoint(
    'List speaking questions (page 1, limit 5)',
    'speaking',
    '/api/speaking/questions?page=1&limit=5'
  )

  // Test 3: Filter by question type
  await testEndpoint(
    'List speaking questions (filter by read_aloud)',
    'speaking',
    '/api/speaking/questions?question_type=read_aloud'
  )

  // Test 4: Filter by difficulty
  await testEndpoint(
    'List speaking questions (filter by difficulty)',
    'speaking',
    '/api/speaking/questions?difficulty=medium'
  )

  // Test 5: Get single question
  await testEndpoint(
    'Get single speaking question',
    'speaking',
    '/api/speaking/questions/1'
  )

  // Test 6: Get non-existent question (expect 404)
  await testEndpoint(
    'Get non-existent speaking question',
    'speaking',
    '/api/speaking/questions/99999',
    {},
    404
  )

  // Test 7: Get speaking attempts
  await testEndpoint(
    'Get speaking attempts',
    'speaking',
    '/api/speaking/attempts'
  )

  // Test 8: Submit speaking attempt (will fail without auth)
  await testEndpoint(
    'Submit speaking attempt (no auth)',
    'speaking',
    '/api/speaking/attempts',
    {
      method: 'POST',
      body: JSON.stringify({
        question_id: 1,
        audio_url: 'https://example.com/test.wav',
        duration: 30,
      }),
    },
    401 // Expect 401 without authentication
  )

  // Test 9: Seed speaking questions
  await testEndpoint(
    'Seed speaking questions',
    'speaking',
    '/api/speaking/seed',
    {
      method: 'POST',
      body: JSON.stringify({
        question_type: 'read_aloud',
        reset: false,
      }),
    }
  )
}

// ============================================================================
// READING SECTION TESTS
// ============================================================================

async function testReadingEndpoints() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('READING SECTION TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: List reading questions
  await testEndpoint(
    'List reading questions',
    'reading',
    '/api/reading/questions'
  )

  // Test 2: List with pagination
  await testEndpoint(
    'List reading questions (pagination)',
    'reading',
    '/api/reading/questions?page=1&limit=5'
  )

  // Test 3: Filter by question type
  await testEndpoint(
    'List reading questions (filter by type)',
    'reading',
    '/api/reading/questions?question_type=multiple-choice-single'
  )

  // Test 4: Get single question
  await testEndpoint(
    'Get single reading question',
    'reading',
    '/api/reading/questions/1'
  )

  // Test 5: Get non-existent question
  await testEndpoint(
    'Get non-existent reading question',
    'reading',
    '/api/reading/questions/99999',
    {},
    404
  )

  // Test 6: Get reading attempts
  await testEndpoint('Get reading attempts', 'reading', '/api/reading/attempts')

  // Test 7: Submit reading attempt (will fail without auth)
  await testEndpoint(
    'Submit reading attempt (no auth)',
    'reading',
    '/api/reading/attempts',
    {
      method: 'POST',
      body: JSON.stringify({
        question_id: 1,
        answer: 'B',
        time_taken: 150,
      }),
    },
    401
  )

  // Test 8: Seed reading questions
  await testEndpoint('Seed reading questions', 'reading', '/api/reading/seed', {
    method: 'POST',
    body: JSON.stringify({
      question_type: 'multiple-choice-single',
      reset: false,
    }),
  })
}

// ============================================================================
// WRITING SECTION TESTS
// ============================================================================

async function testWritingEndpoints() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('WRITING SECTION TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: List writing questions
  await testEndpoint(
    'List writing questions',
    'writing',
    '/api/writing/questions'
  )

  // Test 2: List with pagination
  await testEndpoint(
    'List writing questions (pagination)',
    'writing',
    '/api/writing/questions?page=1&limit=5'
  )

  // Test 3: Filter by question type
  await testEndpoint(
    'List writing questions (filter by type)',
    'writing',
    '/api/writing/questions?question_type=write-essay'
  )

  // Test 4: Get single question
  await testEndpoint(
    'Get single writing question',
    'writing',
    '/api/writing/questions/1'
  )

  // Test 5: Get non-existent question
  await testEndpoint(
    'Get non-existent writing question',
    'writing',
    '/api/writing/questions/99999',
    {},
    404
  )

  // Test 6: Get writing attempts
  await testEndpoint('Get writing attempts', 'writing', '/api/writing/attempts')

  // Test 7: Submit writing attempt (will fail without auth)
  await testEndpoint(
    'Submit writing attempt (no auth)',
    'writing',
    '/api/writing/attempts',
    {
      method: 'POST',
      body: JSON.stringify({
        question_id: 1,
        answer:
          'This is a test essay with sufficient content to meet minimum requirements.',
        word_count: 12,
        time_taken: 600,
      }),
    },
    401
  )

  // Test 8: Seed writing questions
  await testEndpoint('Seed writing questions', 'writing', '/api/writing/seed', {
    method: 'POST',
    body: JSON.stringify({
      question_type: 'write-essay',
      reset: false,
    }),
  })
}

// ============================================================================
// LISTENING SECTION TESTS
// ============================================================================

async function testListeningEndpoints() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('LISTENING SECTION TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: List listening questions
  await testEndpoint(
    'List listening questions',
    'listening',
    '/api/listening/questions'
  )

  // Test 2: List with pagination
  await testEndpoint(
    'List listening questions (pagination)',
    'listening',
    '/api/listening/questions?page=1&limit=5'
  )

  // Test 3: Filter by question type
  await testEndpoint(
    'List listening questions (filter by type)',
    'listening',
    '/api/listening/questions?question_type=summarize-spoken-text'
  )

  // Test 4: Get single question
  await testEndpoint(
    'Get single listening question',
    'listening',
    '/api/listening/questions/1'
  )

  // Test 5: Get non-existent question
  await testEndpoint(
    'Get non-existent listening question',
    'listening',
    '/api/listening/questions/99999',
    {},
    404
  )

  // Test 6: Get listening attempts
  await testEndpoint(
    'Get listening attempts',
    'listening',
    '/api/listening/attempts'
  )

  // Test 7: Submit listening attempt (will fail without auth)
  await testEndpoint(
    'Submit listening attempt (no auth)',
    'listening',
    '/api/listening/attempts',
    {
      method: 'POST',
      body: JSON.stringify({
        question_id: 1,
        answer: 'This is a test summary of the audio content.',
        time_taken: 500,
      }),
    },
    401
  )

  // Test 8: Seed listening questions
  await testEndpoint(
    'Seed listening questions',
    'listening',
    '/api/listening/seed',
    {
      method: 'POST',
      body: JSON.stringify({
        question_type: 'summarize-spoken-text',
        reset: false,
      }),
    }
  )
}

// ============================================================================
// UNIFIED SEED TESTS
// ============================================================================

async function testUnifiedSeedEndpoint() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('UNIFIED SEED ENDPOINT TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: Seed all sections
  await testEndpoint('Seed all sections', 'seed-all', '/api/seed-all', {
    method: 'POST',
    body: JSON.stringify({
      sections: ['speaking', 'reading', 'writing', 'listening'],
      reset: false,
    }),
  })

  // Test 2: Seed specific section
  await testEndpoint(
    'Seed specific section (speaking)',
    'seed-all',
    '/api/seed-all',
    {
      method: 'POST',
      body: JSON.stringify({
        sections: ['speaking'],
        reset: false,
      }),
    }
  )

  // Test 3: Invalid section name
  await testEndpoint(
    'Seed with invalid section name',
    'seed-all',
    '/api/seed-all',
    {
      method: 'POST',
      body: JSON.stringify({
        sections: ['invalid_section'],
        reset: false,
      }),
    },
    400
  )
}

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

async function testErrorHandling() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('ERROR HANDLING TESTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Test 1: Invalid endpoint (404)
  await testEndpoint('Invalid endpoint', 'error', '/api/nonexistent', {}, 404)

  // Test 2: Invalid question ID format
  await testEndpoint(
    'Invalid question ID format',
    'error',
    '/api/speaking/questions/invalid',
    {},
    400
  )

  // Test 3: Missing required fields in POST
  await testEndpoint(
    'Missing required fields',
    'error',
    '/api/speaking/attempts',
    {
      method: 'POST',
      body: JSON.stringify({
        question_id: 1,
        // Missing audio_url
      }),
    },
    400
  )
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('TEST SUMMARY REPORT', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const sections = [
    'speaking',
    'reading',
    'writing',
    'listening',
    'seed-all',
    'error',
  ]

  sections.forEach((section) => {
    const sectionResults = results.filter((r) => r.section === section)
    if (sectionResults.length === 0) return

    const sectionPassed = sectionResults.filter((r) => r.passed).length
    const sectionFailed = sectionResults.filter((r) => !r.passed).length
    const avgDuration = Math.round(
      sectionResults.reduce((sum, r) => sum + r.duration, 0) /
        sectionResults.length
    )

    log(`\n${section.toUpperCase()} Section:`, colors.cyan)
    log(`  Tests Run: ${sectionResults.length}`)
    logPass(`  Passed: ${sectionPassed}`)
    if (sectionFailed > 0) {
      logFail(`  Failed: ${sectionFailed}`)
    }
    log(`  Average Duration: ${avgDuration}ms`, colors.gray)

    if (sectionFailed > 0) {
      log('  Failed Tests:', colors.red)
      sectionResults
        .filter((r) => !r.passed)
        .forEach((r) => {
          log(`    - ${r.name}: ${r.error}`, colors.red)
        })
    }
  })

  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('OVERALL RESULTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  log(`\nTotal Tests: ${testCount}`)
  logPass(`Passed: ${passCount}`)
  if (failCount > 0) {
    logFail(`Failed: ${failCount}`)
  }

  const successRate = Math.round((passCount / testCount) * 100)
  const successColor =
    successRate >= 90
      ? colors.green
      : successRate >= 70
        ? colors.yellow
        : colors.red
  log(`Success Rate: ${successRate}%`, successColor)

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  log(`\nTotal Duration: ${(totalDuration / 1000).toFixed(2)}s`, colors.gray)

  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )

  if (failCount > 0) {
    logWarning('\n⚠ Some tests failed. Please review the errors above.')
    process.exit(1)
  } else {
    logPass('\n✓ All tests passed!')
    process.exit(0)
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log(
    '\n╔═══════════════════════════════════════════════════════╗',
    colors.bright
  )
  log('║   PTE ACADEMIC PRACTICE SYSTEM - API TESTS          ║', colors.bright)
  log(
    '╚═══════════════════════════════════════════════════════╝',
    colors.bright
  )

  log(`\nBase URL: ${BASE_URL}`, colors.blue)
  log(`Target Section: ${TARGET_SECTION || 'All sections'}`, colors.blue)
  log(`Verbose Mode: ${VERBOSE ? 'ON' : 'OFF'}`, colors.blue)

  try {
    await setupAuthentication()

    if (!TARGET_SECTION || TARGET_SECTION === 'speaking') {
      await testSpeakingEndpoints()
    }

    if (!TARGET_SECTION || TARGET_SECTION === 'reading') {
      await testReadingEndpoints()
    }

    if (!TARGET_SECTION || TARGET_SECTION === 'writing') {
      await testWritingEndpoints()
    }

    if (!TARGET_SECTION || TARGET_SECTION === 'listening') {
      await testListeningEndpoints()
    }

    if (!TARGET_SECTION) {
      await testUnifiedSeedEndpoint()
      await testErrorHandling()
    }

    generateReport()
  } catch (error) {
    log(
      '\n═══════════════════════════════════════════════════════',
      colors.bright
    )
    logFail(`FATAL ERROR: ${error}`)
    log(
      '═══════════════════════════════════════════════════════',
      colors.bright
    )
    process.exit(1)
  }
}

// Run the tests
main()
