import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:FIomnuqssqiTlJvGIePMPZZBjZzNbZKS@drizzle-gateway-production-0002.up.railway.app/railway';

async function testConnection() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL database!');

    const result = await client.query('SELECT version()');
    console.log('✓ Database version:', result.rows[0].version);

    // Test listing tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n✓ Found', tables.rows.length, 'tables in database:');
    tables.rows.forEach(row => console.log('  -', row.table_name));

  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Connection closed');
  }
}

testConnection();
