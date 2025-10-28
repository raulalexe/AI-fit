import { supabase } from './supabase';
import { UserProfile, WorkoutPlan, Exercise, Meal, NutritionPlan } from '../types';

export class DatabaseService {
  // User Profile Operations
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Exercise Operations
  async getExercises(filters?: {
    category?: string;
    difficulty?: string;
    equipment?: string[];
    muscleGroups?: string[];
  }) {
    let query = supabase
      .from('exercises')
      .select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.overlaps('equipment', filters.equipment);
    }
    if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
      query = query.overlaps('muscle_groups', filters.muscleGroups);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getExerciseById(exerciseId: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Workout Plan Operations
  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserWorkoutPlans(userId: string) {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_plan_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getWorkoutPlanById(planId: string) {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_plan_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>) {
    const { data, error } = await supabase
      .from('workout_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteWorkoutPlan(planId: string) {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
  }

  // Workout Session Operations
  async startWorkoutSession(session: {
    user_id: string;
    workout_plan_id?: string;
    total_exercises: number;
  }) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async completeWorkoutSession(sessionId: string, updates: {
    completed_at?: string;
    total_duration_minutes?: number;
    exercises_completed?: number;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserWorkoutSessions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_plans (name, description)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Meal Operations
  async getMeals(filters?: {
    mealType?: string;
    maxCalories?: number;
    minProtein?: number;
  }) {
    let query = supabase
      .from('meals')
      .select('*');

    if (filters?.mealType) {
      query = query.eq('meal_type', filters.mealType);
    }
    if (filters?.maxCalories) {
      query = query.lte('calories', filters.maxCalories);
    }
    if (filters?.minProtein) {
      query = query.gte('protein', filters.minProtein);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getMealById(mealId: string) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Nutrition Plan Operations
  async createNutritionPlan(plan: Omit<NutritionPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserNutritionPlans(userId: string) {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select(`
        *,
        nutrition_plan_meals (
          *,
          meals (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getNutritionPlanById(planId: string) {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select(`
        *,
        nutrition_plan_meals (
          *,
          meals (*)
        )
      `)
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Progress Analytics
  async logProgressMetric(userId: string, metric: {
    metric_name: string;
    metric_value: number;
    measurement_date: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase
      .from('progress_analytics')
      .insert({
        user_id: userId,
        ...metric,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProgressAnalytics(userId: string, metricName?: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('progress_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('measurement_date', startDate.toISOString().split('T')[0])
      .order('measurement_date', { ascending: true });

    if (metricName) {
      query = query.eq('metric_name', metricName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // AI Analysis Results
  async saveAIAnalysis(userId: string, analysis: {
    analysis_type: string;
    input_data: any;
    output_data: any;
    confidence_score?: number;
    model_version?: string;
    processing_time_ms?: number;
  }) {
    const { data, error } = await supabase
      .from('ai_analysis_results')
      .insert({
        user_id: userId,
        ...analysis,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAIAnalysisResults(userId: string, analysisType?: string, limit = 50) {
    let query = supabase
      .from('ai_analysis_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (analysisType) {
      query = query.eq('analysis_type', analysisType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export const databaseService = new DatabaseService();
export default databaseService;