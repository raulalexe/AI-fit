-- Insert workout plan exercises for the sample workout plans
-- This assumes the workout plans and exercises from 01_sample_data.sql exist

-- Beginner Full Body workout plan exercises
INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
SELECT 
    wp.id,
    e.id,
    row_number() OVER (ORDER BY e.name) as order_index,
    CASE 
        WHEN e.category = 'strength' THEN 3
        WHEN e.category = 'cardio' THEN 1
        ELSE 2
    END as sets,
    CASE 
        WHEN e.category = 'strength' THEN 12
        WHEN e.category = 'cardio' THEN 30
        ELSE 10
    END as reps,
    CASE 
        WHEN e.category = 'strength' THEN 60
        WHEN e.category = 'cardio' THEN 30
        ELSE 45
    END as rest_seconds,
    'Focus on proper form and controlled movements'
FROM public.workout_plans wp
CROSS JOIN public.exercises e
WHERE wp.name = 'Beginner Full Body'
AND e.difficulty = 'beginner'
AND e.category IN ('strength', 'cardio', 'flexibility')
ORDER BY e.category, e.name;

-- HIIT Cardio Blast workout plan exercises
INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds, notes)
SELECT 
    wp.id,
    e.id,
    row_number() OVER (ORDER BY e.name) as order_index,
    4 as sets,
    1 as reps,
    CASE 
        WHEN e.name = 'Burpees' THEN 45
        WHEN e.name = 'Mountain Climbers' THEN 30
        ELSE 20
    END as duration_seconds,
    15 as rest_seconds,
    'High intensity - give maximum effort during work periods'
FROM public.workout_plans wp
CROSS JOIN public.exercises e
WHERE wp.name = 'HIIT Cardio Blast'
AND e.category = 'cardio'
AND e.difficulty IN ('intermediate', 'advanced')
ORDER BY e.name;

-- Upper Body Strength workout plan exercises
INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
SELECT 
    wp.id,
    e.id,
    row_number() OVER (ORDER BY e.name) as order_index,
    4 as sets,
    CASE 
        WHEN e.name = 'Pull-ups' THEN 8
        WHEN e.name = 'Bench Press' THEN 10
        ELSE 12
    END as reps,
    90 as rest_seconds,
    'Focus on progressive overload - increase weight when possible'
FROM public.workout_plans wp
CROSS JOIN public.exercises e
WHERE wp.name = 'Upper Body Strength'
AND e.category = 'strength'
AND e.difficulty IN ('intermediate', 'advanced')
AND e.muscle_groups && ARRAY['chest', 'shoulders', 'triceps', 'lats', 'biceps', 'rhomboids']
ORDER BY e.name;

-- Yoga Flow workout plan exercises
INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, duration_seconds, rest_seconds, notes)
SELECT 
    wp.id,
    e.id,
    row_number() OVER (ORDER BY e.name) as order_index,
    1 as sets,
    60 as duration_seconds,
    10 as rest_seconds,
    'Hold each pose with deep breathing and focus on alignment'
FROM public.workout_plans wp
CROSS JOIN public.exercises e
WHERE wp.name = 'Yoga Flow'
AND e.category = 'flexibility'
ORDER BY e.name;

-- Surfing Prep workout plan exercises
INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds, notes)
SELECT 
    wp.id,
    e.id,
    row_number() OVER (ORDER BY e.name) as order_index,
    CASE 
        WHEN e.name = 'Surfing Pop-up' THEN 5
        ELSE 3
    END as sets,
    CASE 
        WHEN e.name = 'Surfing Pop-up' THEN 10
        ELSE 15
    END as reps,
    CASE 
        WHEN e.name = 'Surfing Pop-up' THEN 30
        ELSE 45
    END as duration_seconds,
    60 as rest_seconds,
    'Focus on explosive movements and core stability'
FROM public.workout_plans wp
CROSS JOIN public.exercises e
WHERE wp.name = 'Surfing Prep'
AND (e.name = 'Surfing Pop-up' OR e.category = 'strength' AND e.muscle_groups && ARRAY['core', 'shoulders', 'legs'])
ORDER BY e.name;