#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const Redis = require('ioredis');
require('dotenv').config();

// Test configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const redisHost = process.env.EXPO_PUBLIC_REDIS_HOST || 'localhost';
const redisPort = process.env.EXPO_PUBLIC_REDIS_PORT || 6379;

// Test functions
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    
    // Test RLS policies
    const { data: rlsTest, error: rlsError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (rlsError && rlsError.code === 'PGRST116') {
      console.log('✅ RLS policies are working (expected error for unauthenticated user)');
    } else {
      console.log('⚠️  RLS policies may not be properly configured');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  
  try {
    const redis = new Redis({
      host: redisHost,
      port: redisPort,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
    
    // Test basic connection
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('Unexpected ping response');
    
    // Test set/get operations
    await redis.set('test:key', 'test:value', 'EX', 10);
    const value = await redis.get('test:key');
    if (value !== 'test:value') throw new Error('Value mismatch');
    
    // Test JSON serialization
    const testObj = { name: 'test', value: 123 };
    await redis.set('test:json', JSON.stringify(testObj), 'EX', 10);
    const retrievedObj = JSON.parse(await redis.get('test:json'));
    if (retrievedObj.name !== testObj.name) throw new Error('JSON serialization failed');
    
    // Cleanup
    await redis.del('test:key', 'test:json');
    await redis.quit();
    
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('Testing database schema...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test table existence
    const tables = [
      'user_profiles',
      'exercises',
      'workout_plans',
      'nutrition_plans',
      'meals',
      'progress_analytics'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) throw new Error(`Table ${table} not accessible: ${error.message}`);
      console.log(`✅ Table ${table} accessible`);
    }
    
    // Test views
    const { data: activePlans, error: viewError } = await supabase
      .from('active_workout_plans')
      .select('count')
      .limit(1);
    
    if (viewError) {
      console.log('⚠️  Views may not be created yet');
    } else {
      console.log('✅ Views accessible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database schema test failed:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('Testing performance...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const redis = new Redis({ host: redisHost, port: redisPort });
    
    // Test database query performance
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    const dbTime = Date.now() - startTime;
    
    // Test Redis performance
    const redisStartTime = Date.now();
    await redis.set('perf:test', 'performance test', 'EX', 10);
    const redisTime = Date.now() - redisStartTime;
    
    await redis.quit();
    
    console.log(`✅ Database query time: ${dbTime}ms`);
    console.log(`✅ Redis operation time: ${redisTime}ms`);
    
    if (dbTime > 1000) {
      console.log('⚠️  Database query time is high, consider optimization');
    }
    
    if (redisTime > 100) {
      console.log('⚠️  Redis operation time is high, check configuration');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database tests...\n');
  
  const tests = [
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Redis Connection', fn: testRedisConnection },
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Performance', fn: testPerformance },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  let allPassed = true;
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status}`);
    if (!result.passed) allPassed = false;
  }
  
  console.log('\n================');
  if (allPassed) {
    console.log('🎉 All tests passed! Database setup is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});