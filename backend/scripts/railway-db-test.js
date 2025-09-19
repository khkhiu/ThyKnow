/**
 * Railway PostgreSQL Connection Test Script
 * 
 * Run with: node scripts/railway-db-test.js
 * Or in Railway: railway run node scripts/railway-db-test.js
 */

const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Railway Database Connection Test');
  console.log('======================================');
  
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nPlease make sure you have:');
    console.log('1. Added the PostgreSQL plugin to your Railway project');
    console.log('2. Linked the PostgreSQL service to your application');
    process.exit(1);
  }
  
  // Log DATABASE_URL (with password masked)
  try {
    const url = new URL(process.env.DATABASE_URL);
    const maskedUrl = `postgresql://${url.username}:****@${url.hostname}:${url.port}${url.pathname}`;
    console.log(`💾 DATABASE_URL format: ${maskedUrl}`);
    
    // Warn if hostname is localhost or 127.0.0.1
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      console.warn('⚠️  WARNING: Your DATABASE_URL points to localhost/127.0.0.1.');
      console.warn('    In Railway, the database runs as a separate service and');
      console.warn('    should have a hostname like containers-us-west-XX.railway.app');
    } else {
      console.log(`✅ Hostname looks valid: ${url.hostname}`);
    }
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    process.exit(1);
  }
  
  // Test connection
  console.log('\n📡 Testing database connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('Attempting to connect to PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query successful. Database time: ${result.rows[0].current_time}`);
    
    // Get database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as username,
        version() as version
    `);
    
    console.log('\n📊 Database Information:');
    console.log(`Database: ${dbInfo.rows[0].database_name}`);
    console.log(`Username: ${dbInfo.rows[0].username}`);
    console.log(`Version: ${dbInfo.rows[0].version}`);
    
    // Check if our tables exist
    console.log('\n📋 Checking for ThyKnow tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found in the database.');
    } else {
      console.log('Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    client.release();
    console.log('\n✨ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. PostgreSQL service is not properly provisioned in Railway');
    console.error('2. DATABASE_URL is incorrect or not properly set');
    console.error('3. Network connectivity issues between services');
    console.error('4. SSL configuration issues');
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify PostgreSQL plugin is added to your project');
    console.log('2. Check Railway dashboard for proper service linking');
    console.log('3. Try reprovisioning the PostgreSQL service');
    console.log('4. Contact Railway support if issues persist');
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection().catch(console.error);