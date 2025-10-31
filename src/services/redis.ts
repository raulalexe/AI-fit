import Redis from 'ioredis';
import Constants from 'expo-constants';

// Redis configuration
const redisConfig = {
  host: Constants.expoConfig?.extra?.redisHost || process.env.EXPO_PUBLIC_REDIS_HOST || 'localhost',
  port: parseInt(Constants.expoConfig?.extra?.redisPort || process.env.EXPO_PUBLIC_REDIS_PORT || '6379'),
  password: Constants.expoConfig?.extra?.redisPassword || process.env.EXPO_PUBLIC_REDIS_PASSWORD,
  db: parseInt(Constants.expoConfig?.extra?.redisDb || process.env.EXPO_PUBLIC_REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis client error:', error);
    });
    
    redisClient.on('close', () => {
      console.log('Redis client connection closed');
    });
  }
  
  return redisClient;
};

// Cache key generators
export const CacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPhotos: (userId: string) => `user:photos:${userId}`,
  workoutPlans: (userId: string) => `user:workout_plans:${userId}`,
  workoutPlan: (planId: string) => `workout_plan:${planId}`,
  workoutSessions: (userId: string, limit?: number) => 
    `user:workout_sessions:${userId}${limit ? `:${limit}` : ''}`,
  nutritionPlans: (userId: string) => `user:nutrition_plans:${userId}`,
  nutritionPlan: (planId: string) => `nutrition_plan:${planId}`,
  nutritionLogs: (userId: string, limit?: number) => 
    `user:nutrition_logs:${userId}${limit ? `:${limit}` : ''}`,
  progressAnalytics: (userId: string, metric?: string) => 
    `user:progress:${userId}${metric ? `:${metric}` : ''}`,
  exercises: (category?: string) => `exercises${category ? `:${category}` : ''}`,
  meals: (mealType?: string) => `meals${mealType ? `:${mealType}` : ''}`,
  userActivitySummary: (userId: string) => `user:activity_summary:${userId}`,
} as const;

// Cache TTL (Time To Live) constants
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  USER_PROFILE: 1800, // 30 minutes
  WORKOUT_PLANS: 3600, // 1 hour
  NUTRITION_PLANS: 3600, // 1 hour
  EXERCISES: 86400, // 24 hours (reference data)
  MEALS: 86400, // 24 hours (reference data)
  PROGRESS_ANALYTICS: 1800, // 30 minutes
} as const;

// Cache service class
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  // Basic cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Pattern-based operations
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error('Cache delPattern error:', error);
      return 0;
    }
  }

  // Hash operations for complex data structures
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache hget error:', error);
      return null;
    }
  }

  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      await this.redis.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache hset error:', error);
      return false;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const result = await this.redis.hgetall(key);
      const parsed: Record<string, T> = {};
      for (const [field, value] of Object.entries(result)) {
        parsed[field] = JSON.parse(value);
      }
      return Object.keys(parsed).length > 0 ? parsed : null;
    } catch (error) {
      console.error('Cache hgetall error:', error);
      return null;
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.redis.lpush(key, ...serializedValues);
    } catch (error) {
      console.error('Cache lpush error:', error);
      return 0;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      console.error('Cache lrange error:', error);
      return [];
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      console.error('Cache sadd error:', error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error('Cache smembers error:', error);
      return [];
    }
  }

  // Cache invalidation helpers
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const patterns = [
        CacheKeys.userProfile(userId),
        CacheKeys.userPhotos(userId),
        CacheKeys.workoutPlans(userId),
        CacheKeys.workoutSessions(userId),
        CacheKeys.nutritionPlans(userId),
        CacheKeys.nutritionLogs(userId),
        CacheKeys.progressAnalytics(userId),
        CacheKeys.userActivitySummary(userId),
      ];
      
      for (const pattern of patterns) {
        await this.delPattern(`${pattern}*`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async invalidateWorkoutPlanCache(planId: string): Promise<void> {
    try {
      await this.del(CacheKeys.workoutPlan(planId));
      // Also invalidate user's workout plans cache
      await this.delPattern(`user:workout_plans:*`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async invalidateNutritionPlanCache(planId: string): Promise<void> {
    try {
      await this.del(CacheKeys.nutritionPlan(planId));
      // Also invalidate user's nutrition plans cache
      await this.delPattern(`user:nutrition_plans:*`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  // Close connection
  async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;