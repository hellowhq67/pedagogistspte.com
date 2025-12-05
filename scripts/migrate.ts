#!/usr/bin/env tsx
/**
 * Database Migration Script
 *
 * This script runs all pending Drizzle ORM migrations against the database.
 * Usage: pnpm db:migrate
 */

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
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

async function runMigrations() {
  console.log('🔄 Starting database migration...\n')
  console.log('📍 Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'))

  // Create a postgres connection for migrations
  const migrationClient = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  const db = drizzle(migrationClient)

  try {
    console.log('🚀 Running migrations...\n')

    await migrate(db, {
      migrationsFolder: './lib/db/migrations',
    })

    console.log('\n✅ Migrations completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
    console.log('🔌 Database connection closed')
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
