#!/usr/bin/env tsx
/**
 * Database Connection Test Script
 *
 * This script tests the database connection and lists all tables.
 * Usage: pnpm tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv'
import postgres from 'postgres'

// Load environment variables
config({ path: '.env.local' })
config()

const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL or POSTGRES_URL is not defined')
  console.error('Please add one to your .env.local or .env file')
  process.exit(1)
}

async function testConnection() {
  console.log('🔌 Testing database connection...\n')
  console.log('📍 Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'))

  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  try {
    // Test basic query
    console.log('\n🧪 Testing basic query...')
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    console.log('✅ Connection successful!')
    console.log('⏰ Server time:', result[0].current_time)
    console.log('📦 PostgreSQL version:', result[0].pg_version)

    // List all tables
    console.log('\n📋 Listing all tables...')
    const tables = await sql`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    if (tables.length === 0) {
      console.log('⚠️  No tables found. You may need to run migrations.')
    } else {
      console.log(`\n✅ Found ${tables.length} tables:`)
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.tablename}`)
      })
    }

    // Check for drizzle migrations table
    console.log('\n🔍 Checking migration status...')
    const migrationCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '__drizzle_migrations'
      ) as has_migrations_table
    `

    if (migrationCheck[0].has_migrations_table) {
      const migrations = await sql`
        SELECT id, hash, created_at
        FROM __drizzle_migrations
        ORDER BY created_at DESC
        LIMIT 5
      `
      console.log(`✅ Found ${migrations.length} recent migrations:`)
      migrations.forEach((migration, index) => {
        console.log(
          `   ${index + 1}. ${migration.id} (${new Date(migration.created_at).toLocaleString()})`
        )
      })
    } else {
      console.log('⚠️  No migrations table found. Run migrations first.')
    }

    console.log('\n✅ Database connection test completed successfully!')
  } catch (error) {
    console.error('\n❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
    console.log('🔌 Connection closed')
  }
}

// Run test
testConnection()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
