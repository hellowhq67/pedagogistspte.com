import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testSeedEndpoints() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  console.log('Testing seed endpoints...\n')

  // Test speaking seed endpoint
  console.log('1. Testing Speaking Seed Endpoint')
  console.log('   POST /api/speaking/seed')
  try {
    const response = await fetch(`${baseUrl}/api/speaking/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: false }),
    })
    const data = await response.json()
    console.log('   Status:', response.status)
    console.log('   Result:', JSON.stringify(data, null, 2))
    console.log('')
  } catch (error) {
    console.error('   Error:', error instanceof Error ? error.message : error)
    console.log('')
  }

  // Test unified seed-all endpoint
  console.log('2. Testing Unified Seed-All Endpoint')
  console.log('   POST /api/seed-all')
  try {
    const response = await fetch(`${baseUrl}/api/seed-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: ['speaking', 'reading', 'writing', 'listening'],
        reset: false,
      }),
    })
    const data = await response.json()
    console.log('   Status:', response.status)
    console.log('   Result:', JSON.stringify(data, null, 2))
    console.log('')
  } catch (error) {
    console.error('   Error:', error instanceof Error ? error.message : error)
    console.log('')
  }
}

testSeedEndpoints().catch(console.error)
