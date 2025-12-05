import { getTests } from '@/lib/db/queries'

// New standardized route replacing the misspelled /api/ptepratice
// Temporary compatibility: keep the old route until all clients are migrated.
export async function GET() {
  try {
    const tests = await getTests()
    return Response.json(tests)
  } catch (error) {
    console.error('Error fetching PTE tests:', error)
    return Response.json({ error: 'Failed to get PTE tests' }, { status: 500 })
  }
}
