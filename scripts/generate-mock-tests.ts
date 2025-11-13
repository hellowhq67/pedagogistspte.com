#!/usr/bin/env tsx

/**
 * Generate 200 PTE Academic Mock Tests
 * Run: npx tsx scripts/generate-mock-tests.ts
 */
import {
  generateAllMockTests,
  generateSingleMockTest,
} from '@/lib/mock-tests/generator'

async function main() {
  const args = process.argv.slice(2)

  if (args.length > 0) {
    // Generate specific test number
    const testNumber = parseInt(args[0])
    if (isNaN(testNumber) || testNumber < 1 || testNumber > 200) {
      console.error('Error: Test number must be between 1 and 200')
      process.exit(1)
    }

    console.log(`Generating Mock Test #${testNumber}...`)
    await generateSingleMockTest(testNumber)
    console.log('Done!')
  } else {
    // Generate all 200 tests
    console.log('Generating all 200 mock tests...')
    console.log('This may take several minutes...\n')
    await generateAllMockTests()
    console.log('\n✨ All mock tests generated successfully!')
  }

  process.exit(0)
}

main().catch((error) => {
  console.error('Error generating mock tests:', error)
  process.exit(1)
})
