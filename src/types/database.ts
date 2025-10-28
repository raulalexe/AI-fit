export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'sport_performance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'sport_specific';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: FitnessGoal;
  activity_level?: ActivityLevel;
  medical_conditions?: string[];
  available_equipment?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  photo_metadata?: any;
  analysis_results?: any;
  taken_at: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  equipment: string[];
  difficulty: DifficultyLevel;
  muscle_groups: string[];
  instructions: string[];
  video_url?: string;
  image_url?: string;
  calories_per_minute?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  difficulty: DifficultyLevel;
  is_ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanExercise {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  order_index: number;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  weight_kg?: number;
  notes?: string;
  created_at: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  started_at: string;
  completed_at?: string;
  total_duration_minutes?: number;
  exercises_completed: number;
  total_exercises: number;
  notes?: string;
  created_at: string;
  workout_plan?: WorkoutPlan;
}

export interface WorkoutSessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  sets_completed?: number;
  reps_completed?: number;
  duration_completed_seconds?: number;
  weight_used_kg?: number;
  rest_taken_seconds?: number;
  notes?: string;
  completed_at: string;
  exercise?: Exercise;
}

export interface NutritionPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  daily_calories: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  daily_fiber?: number;
  is_ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients: string[];
  instructions: string[];
  prep_time_minutes?: number;
  meal_type: MealType;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionPlanMeal {
  id: string;
  nutrition_plan_id: string;
  meal_id: string;
  day_of_week?: number; // 0 = Sunday
  meal_order?: number;
  quantity: number;
  created_at: string;
  meal?: Meal;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  meal_id: string;
  consumed_at: string;
  quantity: number;
  notes?: string;
  created_at: string;
  meal?: Meal;
}

export interface ProgressAnalytics {
  id: string;
  user_id: string;
  metric_name: string;
  metric_value: number;
  measurement_date: string;
  metadata?: any;
  created_at: string;
}

export interface AIAnalysisResult {
  id: string;
  user_id: string;
  analysis_type: string;
  input_data: any;
  output_data: any;
  confidence_score?: number;
  model_version?: string;
  processing_time_ms?: number;
  created_at: string;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: any;
}

// API request/response types
export interface CreateUserProfileRequest {
  email: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: FitnessGoal;
  activity_level?: ActivityLevel;
  medical_conditions?: string[];
  available_equipment?: string[];
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  avatar_url?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: FitnessGoal;
  activity_level?: ActivityLevel;
  medical_conditions?: string[];
  available_equipment?: string[];
}

export interface CreateWorkoutPlanRequest {
  name: string;
  description?: string;
  duration_minutes: number;
  difficulty: DifficultyLevel;
  is_ai_generated?: boolean;
  ai_prompt?: string;
  exercises: {
    exercise_id: string;
    order_index: number;
    sets?: number;
    reps?: number;
    duration_seconds?: number;
    rest_seconds?: number;
    weight_kg?: number;
    notes?: string;
  }[];
}

export interface CreateNutritionPlanRequest {
  name: string;
  description?: string;
  daily_calories: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  daily_fiber?: number;
  is_ai_generated?: boolean;
  ai_prompt?: string;
  meals: {
    meal_id: string;
    day_of_week?: number;
    meal_order?: number;
    quantity?: number;
  }[];
}

export interface LogProgressMetricRequest {
  metric_name: string;
  metric_value: number;
  measurement_date: string;
  metadata?: any;
}

export interface SaveAIAnalysisRequest {
  analysis_type: string;
  input_data: any;
  output_data: any;
  confidence_score?: number;
  model_version?: string;
  processing_time_ms?: number;
}