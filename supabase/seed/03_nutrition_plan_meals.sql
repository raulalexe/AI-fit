-- Insert nutrition plan meals for the sample nutrition plans
-- This assumes the nutrition plans and meals from 01_sample_data.sql exist

-- Weight Loss Plan meals (7 days)
INSERT INTO public.nutrition_plan_meals (nutrition_plan_id, meal_id, day_of_week, meal_order, quantity)
SELECT 
    np.id,
    m.id,
    day_num,
    meal_order,
    1.0 as quantity
FROM public.nutrition_plans np
CROSS JOIN public.meals m
CROSS JOIN generate_series(0, 6) as day_num
CROSS JOIN generate_series(1, 4) as meal_order
WHERE np.name = 'Weight Loss Plan'
AND (
    (meal_order = 1 AND m.meal_type = 'breakfast') OR
    (meal_order = 2 AND m.meal_type = 'lunch') OR
    (meal_order = 3 AND m.meal_type = 'dinner') OR
    (meal_order = 4 AND m.meal_type = 'snack')
)
AND m.calories <= 500  -- Weight loss focused on lower calorie meals
ORDER BY day_num, meal_order, m.calories;

-- Muscle Building Plan meals (7 days)
INSERT INTO public.nutrition_plan_meals (nutrition_plan_id, meal_id, day_of_week, meal_order, quantity)
SELECT 
    np.id,
    m.id,
    day_num,
    meal_order,
    CASE 
        WHEN m.meal_type = 'pre_workout' THEN 0.5
        WHEN m.meal_type = 'post_workout' THEN 1.5
        ELSE 1.0
    END as quantity
FROM public.nutrition_plans np
CROSS JOIN public.meals m
CROSS JOIN generate_series(0, 6) as day_num
CROSS JOIN generate_series(1, 5) as meal_order
WHERE np.name = 'Muscle Building'
AND (
    (meal_order = 1 AND m.meal_type = 'breakfast') OR
    (meal_order = 2 AND m.meal_type = 'pre_workout') OR
    (meal_order = 3 AND m.meal_type = 'post_workout') OR
    (meal_order = 4 AND m.meal_type = 'dinner') OR
    (meal_order = 5 AND m.meal_type = 'snack')
)
AND m.protein >= 15  -- High protein focus for muscle building
ORDER BY day_num, meal_order, m.protein DESC;

-- Athlete Performance Plan meals (7 days)
INSERT INTO public.nutrition_plan_meals (nutrition_plan_id, meal_id, day_of_week, meal_order, quantity)
SELECT 
    np.id,
    m.id,
    day_num,
    meal_order,
    CASE 
        WHEN m.meal_type = 'pre_workout' THEN 0.8
        WHEN m.meal_type = 'post_workout' THEN 1.2
        ELSE 1.0
    END as quantity
FROM public.nutrition_plans np
CROSS JOIN public.meals m
CROSS JOIN generate_series(0, 6) as day_num
CROSS JOIN generate_series(1, 6) as meal_order
WHERE np.name = 'Athlete Performance'
AND (
    (meal_order = 1 AND m.meal_type = 'breakfast') OR
    (meal_order = 2 AND m.meal_type = 'snack') OR
    (meal_order = 3 AND m.meal_type = 'pre_workout') OR
    (meal_order = 4 AND m.meal_type = 'post_workout') OR
    (meal_order = 5 AND m.meal_type = 'lunch') OR
    (meal_order = 6 AND m.meal_type = 'dinner')
)
ORDER BY day_num, meal_order, m.calories;

-- Plant-Based Plan meals (7 days)
INSERT INTO public.nutrition_plan_meals (nutrition_plan_id, meal_id, day_of_week, meal_order, quantity)
SELECT 
    np.id,
    m.id,
    day_num,
    meal_order,
    1.0 as quantity
FROM public.nutrition_plans np
CROSS JOIN public.meals m
CROSS JOIN generate_series(0, 6) as day_num
CROSS JOIN generate_series(1, 4) as meal_order
WHERE np.name = 'Plant-Based'
AND (
    (meal_order = 1 AND m.meal_type = 'breakfast') OR
    (meal_order = 2 AND m.meal_type = 'lunch') OR
    (meal_order = 3 AND m.meal_type = 'dinner') OR
    (meal_order = 4 AND m.meal_type = 'snack')
)
AND (
    m.name ILIKE '%quinoa%' OR
    m.name ILIKE '%lentil%' OR
    m.name ILIKE '%chickpea%' OR
    m.name ILIKE '%vegetable%' OR
    m.name ILIKE '%salad%' OR
    m.name ILIKE '%smoothie%' OR
    m.ingredients && ARRAY['quinoa', 'lentils', 'chickpeas', 'tofu', 'tempeh', 'nuts', 'seeds']
)
ORDER BY day_num, meal_order, m.name;