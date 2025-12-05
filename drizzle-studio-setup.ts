import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create a postgres client
const client = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
})

// Create drizzle instance with both schemas
const db = drizzle(client, {
  schema: {
    // Main schema tables
    // userSubscriptions is now in schema-lessons
  },
})

async function setupDrizzleStudio() {
  console.log('🚀 Setting up Drizzle Studio...')
  
  try {
    // Check database connection
    console.log('🔗 Testing database connection...')
    await client`SELECT 1`
    console.log('✅ Database connected successfully!')
    
    // Test accessing main tables
    const [userCount] = await client`SELECT COUNT(*)::int as count FROM users`
    console.log(`👥 Current user count: ${userCount.count}`)
    
    const [subscriptionCount] = await client`SELECT COUNT(*)::int as count FROM user_subscriptions`
    console.log(`📊 Current subscription count: ${subscriptionCount.count}`)
    
    console.log('🎉 Database is ready!')
    console.log('')
    console.log('📝 To start Drizzle Studio:')
    console.log('npx drizzle-kit studio')
    console.log('')
    console.log('🔧 To generate migrations:')
    console.log('npx drizzle-kit generate')
    console.log('')
    console.log('📦 To push schema changes:')
    console.log('npx drizzle-kit push')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

setupDrizzleStudio().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})