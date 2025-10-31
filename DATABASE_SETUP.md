# Database Setup Guide

This guide covers the complete database setup for the AI Fitness App, including PostgreSQL with Supabase, Redis caching, and performance optimizations.

## Overview

The database setup includes:
- **PostgreSQL** with Supabase for primary data storage
- **Redis** for caching and session management
- **Connection pooling** for optimal performance
- **Row Level Security (RLS)** for data protection
- **Performance monitoring** and optimization

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Supabase project created
- Environment variables configured

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
EXPO_PUBLIC_REDIS_HOST=localhost
EXPO_PUBLIC_REDIS_PORT=6379
EXPO_PUBLIC_REDIS_PASSWORD=
EXPO_PUBLIC_REDIS_DB=0
```

## Database Schema

### Core Tables

1. **user_profiles** - User account information and preferences
2. **user_photos** - User profile and progress photos
3. **exercises** - Exercise library with metadata
4. **workout_plans** - User-created workout plans
5. **workout_plan_exercises** - Exercises within workout plans
6. **workout_sessions** - Completed workout sessions
7. **workout_session_exercises** - Exercise details within sessions
8. **nutrition_plans** - User-created nutrition plans
9. **meals** - Meal library with nutritional information
10. **nutrition_plan_meals** - Meals within nutrition plans
11. **nutrition_logs** - User's daily nutrition logging
12. **progress_analytics** - User progress tracking data
13. **ai_analysis_results** - AI-generated insights and recommendations

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **Comprehensive indexing** for optimal query performance
- **Data validation constraints** for data integrity
- **Soft delete support** for user data
- **Automatic timestamp updates** with triggers
- **Performance monitoring** functions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Redis

```bash
# Start Redis with Docker Compose
docker-compose -f docker-compose.redis.yml up -d

# Verify Redis is running
docker ps | grep redis
```

### 3. Run Database Setup

```bash
# Make the setup script executable
chmod +x scripts/setup-database.js

# Run the database setup
node scripts/setup-database.js
```

### 4. Verify Setup

```bash
# Test database connection
npm run test:database

# Test Redis connection
npm run test:redis
```

## Database Services

### Enhanced Database Service

The `EnhancedDatabaseService` provides:
- **Connection pooling** for optimal performance
- **Automatic caching** with Redis
- **Query optimization** and monitoring
- **Error handling** and retry logic

```typescript
import { enhancedDatabaseService } from './services/enhanced-database';

// Get user profile with caching
const profile = await enhancedDatabaseService.getUserProfile(userId);

// Create workout plan with cache invalidation
const plan = await enhancedDatabaseService.createWorkoutPlan(workoutData);
```

### Cache Service

The `CacheService` provides:
- **Automatic serialization** of complex objects
- **TTL management** for different data types
- **Pattern-based cache invalidation**
- **Health monitoring** and statistics

```typescript
import { cacheService } from './services/redis';

// Cache user data
await cacheService.set('user:123', userData, 3600);

// Get cached data
const userData = await cacheService.get('user:123');

// Invalidate user cache
await cacheService.invalidateUserCache('123');
```

### Database Monitor

The `DatabaseMonitor` provides:
- **Query performance tracking**
- **Connection pool monitoring**
- **Cache hit rate analysis**
- **Performance recommendations**

```typescript
import { databaseMonitor } from './services/database-monitor';

// Track query performance
const result = await databaseMonitor.trackQuery('getUserProfile', () => 
  enhancedDatabaseService.getUserProfile(userId)
);

// Get performance metrics
const metrics = databaseMonitor.getMetrics();
```

## Performance Optimizations

### Database Indexes

- **Primary key indexes** on all tables
- **Foreign key indexes** for joins
- **Composite indexes** for common queries
- **Partial indexes** for filtered queries
- **GIN indexes** for JSON and array columns

### Caching Strategy

- **User profiles**: 30 minutes TTL
- **Workout plans**: 1 hour TTL
- **Nutrition plans**: 1 hour TTL
- **Exercises/Meals**: 24 hours TTL (reference data)
- **Progress analytics**: 30 minutes TTL

### Connection Pooling

- **Maximum connections**: 10
- **Minimum connections**: 2
- **Connection timeout**: 30 seconds
- **Idle timeout**: 5 minutes
- **Automatic retry** with exponential backoff

## Monitoring and Maintenance

### Health Checks

```typescript
// Check database health
const health = await databaseMonitor.healthCheck();

// Get performance report
const report = await databaseMonitor.generateReport();
```

### Maintenance Tasks

1. **Regular cleanup** of old data
2. **Index maintenance** and optimization
3. **Cache warming** for frequently accessed data
4. **Performance monitoring** and alerting

### Backup Strategy

- **Automated backups** via Supabase
- **Point-in-time recovery** capabilities
- **Cross-region replication** for disaster recovery

## Troubleshooting

### Common Issues

1. **Connection timeouts**: Check network connectivity and pool settings
2. **Cache misses**: Verify Redis configuration and TTL settings
3. **Query performance**: Check indexes and query optimization
4. **Memory usage**: Monitor Redis memory usage and eviction policies

### Debug Commands

```bash
# Check Redis status
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check database connections
psql -h your_host -U your_user -d your_db -c "SELECT * FROM pg_stat_activity;"
```

## Security Considerations

- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** policies
- **Secure connection** to Redis
- **Environment variable** protection
- **Regular security updates** and patches

## Scaling Considerations

- **Horizontal scaling** with read replicas
- **Cache clustering** for high availability
- **Connection pool** scaling based on load
- **Database sharding** for large datasets

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Contact the development team
4. Create an issue in the project repository