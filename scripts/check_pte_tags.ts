// Quick check: verify pte_questions.tags column exists and type is jsonb
import 'dotenv/config'
import postgres from 'postgres'

async function main() {
  const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error(
      'Neither POSTGRES_URL nor DATABASE_URL is defined. Add one to .env.local or .env.'
    )
  }

  const sql = postgres(DATABASE_URL, { max: 1, prepare: false })
  try {
    const rows = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'pte_questions'
        AND column_name = 'tags'
    `
    const result = {
      exists: rows.length > 0,
      column: rows[0] || null,
    }
    console.log(JSON.stringify(result, null, 2))
    if (!result.exists) {
      process.exitCode = 2
    }
  } catch (e) {
    console.error('[check] Query failed:', e)
    process.exitCode = 1
  } finally {
    await sql.end({ timeout: 5_000 })
  }
}

main().catch((e) => {
  console.error('[check] Fatal error:', e)
  process.exit(1)
})
