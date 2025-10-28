import { databasePool } from './database-pool';
import { cacheService, CacheKeys, CacheTTL } from './redis';
import { UserProfile, WorkoutPlan, NutritionPlan, Exercise, Meal, WorkoutSession, NutritionLog, ProgressAnalytics } from '../types/database';

// Enhanced database service with caching and connection pooling
export class EnhancedDatabaseService {
  private pool = databasePool;
  private cache = cacheService;

  // User Profile Operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = CacheKeys.userProfile(userId);
    
    // Try to get from cache first
    const cached = await this.cache.get<UserProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    });

    // Cache the result
    if (result) {
      await this.cache.set(cacheKey, result, CacheTTL.USER_PROFILE);
    }

    return result;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    // Invalidate cache
    if (result) {
      await this.cache.invalidateUserCache(userId);
    }

    return result;
  }

  // Workout Plan Operations
  async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    const cacheKey = CacheKeys.workoutPlans(userId);
    
    // Try to get from cache first
    const cached = await this.cache.get<WorkoutPlan[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.WORKOUT_PLANS);

    return result;
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
    const cacheKey = CacheKeys.workoutPlan(planId);
    
    // Try to get from cache first
    const cached = await this.cache.get<WorkoutPlan>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_plans')
        .select('*')
        .eq('id', planId)
        .eq('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    });

    // Cache the result
    if (result) {
      await this.cache.set(cacheKey, result, CacheTTL.WORKOUT_PLANS);
    }

    return result;
  }

  async createWorkoutPlan(workoutPlan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutPlan | null> {
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_plans')
        .insert(workoutPlan)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    // Invalidate cache
    if (result) {
      await this.cache.invalidateUserCache(workoutPlan.user_id);
    }

    return result;
  }

  async updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan | null> {
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    // Invalidate cache
    if (result) {
      await this.cache.invalidateWorkoutPlanCache(planId);
    }

    return result;
  }

  // Nutrition Plan Operations
  async getNutritionPlans(userId: string): Promise<NutritionPlan[]> {
    const cacheKey = CacheKeys.nutritionPlans(userId);
    
    // Try to get from cache first
    const cached = await this.cache.get<NutritionPlan[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.NUTRITION_PLANS);

    return result;
  }

  async getNutritionPlan(planId: string): Promise<NutritionPlan | null> {
    const cacheKey = CacheKeys.nutritionPlan(planId);
    
    // Try to get from cache first
    const cached = await this.cache.get<NutritionPlan>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('nutrition_plans')
        .select('*')
        .eq('id', planId)
        .eq('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    });

    // Cache the result
    if (result) {
      await this.cache.set(cacheKey, result, CacheTTL.NUTRITION_PLANS);
    }

    return result;
  }

  // Exercise Operations (Reference Data)
  async getExercises(category?: string): Promise<Exercise[]> {
    const cacheKey = CacheKeys.exercises(category);
    
    // Try to get from cache first
    const cached = await this.cache.get<Exercise[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      let query = client.from('exercises').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.EXERCISES);

    return result;
  }

  // Meal Operations (Reference Data)
  async getMeals(mealType?: string): Promise<Meal[]> {
    const cacheKey = CacheKeys.meals(mealType);
    
    // Try to get from cache first
    const cached = await this.cache.get<Meal[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      let query = client.from('meals').select('*');
      
      if (mealType) {
        query = query.eq('meal_type', mealType);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.MEALS);

    return result;
  }

  // Workout Session Operations
  async getWorkoutSessions(userId: string, limit: number = 50): Promise<WorkoutSession[]> {
    const cacheKey = CacheKeys.workoutSessions(userId, limit);
    
    // Try to get from cache first
    const cached = await this.cache.get<WorkoutSession[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.MEDIUM);

    return result;
  }

  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSession | null> {
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('workout_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    // Invalidate cache
    if (result) {
      await this.cache.invalidateUserCache(session.user_id);
    }

    return result;
  }

  // Nutrition Log Operations
  async getNutritionLogs(userId: string, limit: number = 50): Promise<NutritionLog[]> {
    const cacheKey = CacheKeys.nutritionLogs(userId, limit);
    
    // Try to get from cache first
    const cached = await this.cache.get<NutritionLog[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.MEDIUM);

    return result;
  }

  async createNutritionLog(log: Omit<NutritionLog, 'id' | 'created_at' | 'updated_at'>): Promise<NutritionLog | null> {
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .from('nutrition_logs')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    // Invalidate cache
    if (result) {
      await this.cache.invalidateUserCache(log.user_id);
    }

    return result;
  }

  // Progress Analytics Operations
  async getProgressAnalytics(userId: string, metric?: string): Promise<ProgressAnalytics[]> {
    const cacheKey = CacheKeys.progressAnalytics(userId, metric);
    
    // Try to get from cache first
    const cached = await this.cache.get<ProgressAnalytics[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.pool.execute(async (client) => {
      let query = client
        .from('progress_analytics')
        .select('*')
        .eq('user_id', userId);
      
      if (metric) {
        query = query.eq('metric_name', metric);
      }
      
      const { data, error } = await query.order('measurement_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    });

    // Cache the result
    await this.cache.set(cacheKey, result, CacheTTL.PROGRESS_ANALYTICS);

    return result;
  }

  // User Activity Summary
  async getUserActivitySummary(userId: string): Promise<any> {
    const cacheKey = CacheKeys.userActivitySummary(userId);
    
    // Try to get from cache first
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database using the stored function
    const result = await this.pool.execute(async (client) => {
      const { data, error } = await client
        .rpc('get_user_activity_summary', { user_uuid: userId });

      if (error) throw error;
      return data;
    });

    // Cache the result
    if (result) {
      await this.cache.set(cacheKey, result, CacheTTL.SHORT);
    }

    return result;
  }

  // Cache management
  async clearUserCache(userId: string): Promise<void> {
    await this.cache.invalidateUserCache(userId);
  }

  async clearAllCache(): Promise<void> {
    await this.cache.delPattern('*');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const poolHealth = await this.pool.healthCheck();
      const cacheHealth = await this.cache.ping();
      return poolHealth && cacheHealth;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get service statistics
  getStats() {
    return {
      pool: this.pool.getPoolStats(),
      cache: {
        ping: this.cache.ping(),
      },
    };
  }
}

// Export singleton instance
export const enhancedDatabaseService = new EnhancedDatabaseService();
export default enhancedDatabaseService;