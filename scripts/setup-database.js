#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- EXPO_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database setup functions
async function runMigrations() {
  console.log('Running database migrations...');
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const migrationPath = path.join(migrationsDir, file);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        throw error;
      }
      console.log(`✓ Migration ${file} completed successfully`);
    } catch (error) {
      console.error(`✗ Migration ${file} failed:`, error);
      throw error;
    }
  }
}

async function seedDatabase() {
  console.log('Seeding database...');
  
  const seedDir = path.join(__dirname, '..', 'supabase', 'seed');
  const seedFiles = fs.readdirSync(seedDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of seedFiles) {
    console.log(`Running seed: ${file}`);
    const seedPath = path.join(seedDir, file);
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: seedSQL });
      if (error) {
        console.error(`Error running seed ${file}:`, error);
        throw error;
      }
      console.log(`✓ Seed ${file} completed successfully`);
    } catch (error) {
      console.error(`✗ Seed ${file} failed:`, error);
      throw error;
    }
  }
}

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✓ Database connection successful');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');
  
  const execSqlFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: execSqlFunction });
    if (error) {
      console.log('exec_sql function may already exist, continuing...');
    } else {
      console.log('✓ exec_sql function created successfully');
    }
  } catch (error) {
    console.log('exec_sql function may already exist, continuing...');
  }
}

async function main() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Test connection first
    await testDatabaseConnection();
    
    // Create exec_sql function if it doesn't exist
    await createExecSqlFunction();
    
    // Run migrations
    await runMigrations();
    
    // Seed database
    await seedDatabase();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start Redis: docker-compose -f docker-compose.redis.yml up -d');
    console.log('2. Update your .env file with Redis configuration');
    console.log('3. Test the application');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();