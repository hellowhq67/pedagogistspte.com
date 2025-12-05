import 'dotenv/config'
import { db } from './lib/db/drizzle'
import { sql } from 'drizzle-orm'

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...')
    
    // Test basic connection
    const result = await db.execute(sql`SELECT NOW() as current_time`)
    console.log('✅ Database connected successfully!')
    console.log('Current time:', result.rows[0]?.current_time)
    
    // Test if we can access the users table
    console.log('👥 Testing users table access...')
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    console.log('✅ Users table accessible!')
    console.log('User count:', userCount.rows[0]?.count)
    
    // Test if we can access schema-lessons tables
    console.log('📚 Testing schema-lessons tables...')
    const subscriptionCount = await db.execute(sql`SELECT COUNT(*) as count FROM user_subscriptions`)
    console.log('✅ User subscriptions table accessible!')
    console.log('Subscription count:', subscriptionCount.rows[0]?.count)
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await db.destroy()
  }
}

testConnection()