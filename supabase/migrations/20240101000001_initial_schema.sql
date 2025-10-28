-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE fitness_goal AS ENUM ('weight_loss', 'muscle_gain', 'endurance', 'sport_performance');
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE exercise_category AS ENUM ('strength', 'cardio', 'flexibility', 'sport_specific');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    age INTEGER CHECK (age > 0 AND age < 150),
    height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 1000),
    fitness_goal fitness_goal,
    activity_level activity_level,
    medical_conditions TEXT[],
    available_equipment TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress photos
CREATE TABLE public.user_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    photo_metadata JSONB,
    analysis_results JSONB,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises database
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category exercise_category NOT NULL,
    equipment TEXT[],
    difficulty difficulty_level NOT NULL,
    muscle_groups TEXT[],
    instructions TEXT[],
    video_url TEXT,
    image_url TEXT,
    calories_per_minute DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout plans
CREATE TABLE public.workout_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    difficulty difficulty_level NOT NULL,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout plan exercises (many-to-many relationship)
CREATE TABLE public.workout_plan_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    weight_kg DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sessions
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INTEGER,
    exercises_completed INTEGER DEFAULT 0,
    total_exercises INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout session exercises (track individual exercise performance)
CREATE TABLE public.workout_session_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    sets_completed INTEGER,
    reps_completed INTEGER,
    duration_completed_seconds INTEGER,
    weight_used_kg DECIMAL(5,2),
    rest_taken_seconds INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition plans
CREATE TABLE public.nutrition_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    daily_calories INTEGER NOT NULL,
    daily_protein DECIMAL(5,2),
    daily_carbs DECIMAL(5,2),
    daily_fat DECIMAL(5,2),
    daily_fiber DECIMAL(5,2),
    is_ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals
CREATE TABLE public.meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    fiber DECIMAL(5,2),
    ingredients TEXT[],
    instructions TEXT[],
    prep_time_minutes INTEGER,
    meal_type meal_type NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition plan meals (many-to-many relationship)
CREATE TABLE public.nutrition_plan_meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nutrition_plan_id UUID REFERENCES public.nutrition_plans(id) ON DELETE CASCADE NOT NULL,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    meal_order INTEGER, -- Order within the day
    quantity DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition logs (user meal consumption tracking)
CREATE TABLE public.nutrition_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quantity DECIMAL(5,2) DEFAULT 1.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress analytics
CREATE TABLE public.progress_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    measurement_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results
CREATE TABLE public.ai_analysis_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL, -- 'photo_analysis', 'workout_recommendation', 'nutrition_plan'
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX idx_user_photos_taken_at ON public.user_photos(taken_at);
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX idx_exercises_equipment ON public.exercises USING GIN(equipment);
CREATE INDEX idx_exercises_muscle_groups ON public.exercises USING GIN(muscle_groups);
CREATE INDEX idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX idx_workout_plans_created_at ON public.workout_plans(created_at);
CREATE INDEX idx_workout_plan_exercises_workout_plan_id ON public.workout_plan_exercises(workout_plan_id);
CREATE INDEX idx_workout_plan_exercises_order ON public.workout_plan_exercises(workout_plan_id, order_index);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_started_at ON public.workout_sessions(started_at);
CREATE INDEX idx_workout_session_exercises_session_id ON public.workout_session_exercises(session_id);
CREATE INDEX idx_nutrition_plans_user_id ON public.nutrition_plans(user_id);
CREATE INDEX idx_nutrition_plans_created_at ON public.nutrition_plans(created_at);
CREATE INDEX idx_meals_meal_type ON public.meals(meal_type);
CREATE INDEX idx_meals_calories ON public.meals(calories);
CREATE INDEX idx_nutrition_plan_meals_plan_id ON public.nutrition_plan_meals(nutrition_plan_id);
CREATE INDEX idx_nutrition_plan_meals_day_order ON public.nutrition_plan_meals(nutrition_plan_id, day_of_week, meal_order);
CREATE INDEX idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_consumed_at ON public.nutrition_logs(consumed_at);
CREATE INDEX idx_progress_analytics_user_id ON public.progress_analytics(user_id);
CREATE INDEX idx_progress_analytics_metric_date ON public.progress_analytics(user_id, metric_name, measurement_date);
CREATE INDEX idx_ai_analysis_user_id ON public.ai_analysis_results(user_id);
CREATE INDEX idx_ai_analysis_type ON public.ai_analysis_results(analysis_type);
CREATE INDEX idx_ai_analysis_created_at ON public.ai_analysis_results(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_workout_plans_updated_at
    BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_nutrition_plans_updated_at
    BEFORE UPDATE ON public.nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_meals_updated_at
    BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User photos: users can only access their own photos
CREATE POLICY "Users can view own photos" ON public.user_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON public.user_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON public.user_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.user_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Workout plans: users can only access their own plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" ON public.workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" ON public.workout_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" ON public.workout_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Workout sessions: users can only access their own sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Nutrition plans: users can only access their own plans
CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans" ON public.nutrition_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans" ON public.nutrition_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition plans" ON public.nutrition_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Nutrition logs: users can only access their own logs
CREATE POLICY "Users can view own nutrition logs" ON public.nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON public.nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON public.nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON public.nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Progress analytics: users can only access their own analytics
CREATE POLICY "Users can view own progress analytics" ON public.progress_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress analytics" ON public.progress_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI analysis results: users can only access their own results
CREATE POLICY "Users can view own AI analysis results" ON public.ai_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI analysis results" ON public.ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public tables (exercises, meals) - readable by all authenticated users
CREATE POLICY "Authenticated users can view exercises" ON public.exercises
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view meals" ON public.meals
    FOR SELECT USING (auth.role() = 'authenticated');