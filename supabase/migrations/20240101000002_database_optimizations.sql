-- Database Optimizations Migration
-- This migration adds performance optimizations, additional constraints, and monitoring

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_photos
CREATE POLICY "Users can view own photos" ON public.user_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON public.user_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON public.user_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.user_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workout_plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" ON public.workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" ON public.workout_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" ON public.workout_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workout_sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for nutrition_plans
CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans" ON public.nutrition_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans" ON public.nutrition_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition plans" ON public.nutrition_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for nutrition_logs
CREATE POLICY "Users can view own nutrition logs" ON public.nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON public.nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON public.nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON public.nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for progress_analytics
CREATE POLICY "Users can view own progress analytics" ON public.progress_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress analytics" ON public.progress_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress analytics" ON public.progress_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_analysis_results
CREATE POLICY "Users can view own AI analysis results" ON public.ai_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI analysis results" ON public.ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for exercises and meals (these are reference data)
CREATE POLICY "Anyone can view exercises" ON public.exercises
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view meals" ON public.meals
    FOR SELECT USING (true);

-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX CONCURRENTLY idx_user_profiles_updated_at ON public.user_profiles(updated_at);
CREATE INDEX CONCURRENTLY idx_workout_sessions_user_id_started_at ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX CONCURRENTLY idx_nutrition_logs_user_id_consumed_at ON public.nutrition_logs(user_id, consumed_at DESC);
CREATE INDEX CONCURRENTLY idx_progress_analytics_user_id_metric_date ON public.progress_analytics(user_id, metric_name, measurement_date DESC);

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_active_workout_plans ON public.workout_plans(user_id, created_at) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_recent_workout_sessions ON public.workout_sessions(user_id, started_at DESC) WHERE started_at > NOW() - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY idx_recent_nutrition_logs ON public.nutrition_logs(user_id, consumed_at DESC) WHERE consumed_at > NOW() - INTERVAL '30 days';

-- Add constraints for data integrity
ALTER TABLE public.user_profiles ADD CONSTRAINT check_age_range CHECK (age >= 13 AND age <= 120);
ALTER TABLE public.user_profiles ADD CONSTRAINT check_height_range CHECK (height_cm >= 100 AND height_cm <= 250);
ALTER TABLE public.user_profiles ADD CONSTRAINT check_weight_range CHECK (weight_kg >= 30 AND weight_kg <= 300);
ALTER TABLE public.exercises ADD CONSTRAINT check_difficulty_valid CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE public.exercises ADD CONSTRAINT check_category_valid CHECK (category IN ('strength', 'cardio', 'flexibility', 'sport_specific'));
ALTER TABLE public.meals ADD CONSTRAINT check_meal_type_valid CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'));
ALTER TABLE public.nutrition_logs ADD CONSTRAINT check_meal_type_valid CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON public.nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for soft delete (optional)
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add deleted_at columns to relevant tables
ALTER TABLE public.workout_plans ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.nutrition_plans ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_photos ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for soft delete queries
CREATE INDEX CONCURRENTLY idx_workout_plans_deleted_at ON public.workout_plans(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_nutrition_plans_deleted_at ON public.nutrition_plans(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_user_photos_deleted_at ON public.user_photos(deleted_at) WHERE deleted_at IS NULL;

-- Create view for active workout plans (excluding soft deleted)
CREATE VIEW active_workout_plans AS
SELECT * FROM public.workout_plans 
WHERE deleted_at IS NULL AND is_active = true;

-- Create view for active nutrition plans (excluding soft deleted)
CREATE VIEW active_nutrition_plans AS
SELECT * FROM public.nutrition_plans 
WHERE deleted_at IS NULL AND is_active = true;

-- Grant permissions for views
GRANT SELECT ON active_workout_plans TO authenticated;
GRANT SELECT ON active_nutrition_plans TO authenticated;

-- Create function to get user's recent activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'recent_workouts', (
            SELECT COUNT(*) 
            FROM public.workout_sessions 
            WHERE user_id = user_uuid 
            AND started_at > NOW() - INTERVAL '7 days'
        ),
        'recent_nutrition_logs', (
            SELECT COUNT(*) 
            FROM public.nutrition_logs 
            WHERE user_id = user_uuid 
            AND consumed_at > NOW() - INTERVAL '7 days'
        ),
        'total_workout_plans', (
            SELECT COUNT(*) 
            FROM public.workout_plans 
            WHERE user_id = user_uuid 
            AND deleted_at IS NULL
        ),
        'total_nutrition_plans', (
            SELECT COUNT(*) 
            FROM public.nutrition_plans 
            WHERE user_id = user_uuid 
            AND deleted_at IS NULL
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_activity_summary(UUID) TO authenticated;

-- Create function to clean up old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete workout sessions older than 1 year
    DELETE FROM public.workout_sessions 
    WHERE started_at < NOW() - INTERVAL '1 year';
    
    -- Delete nutrition logs older than 1 year
    DELETE FROM public.nutrition_logs 
    WHERE consumed_at < NOW() - INTERVAL '1 year';
    
    -- Delete AI analysis results older than 6 months
    DELETE FROM public.ai_analysis_results 
    WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO service_role;