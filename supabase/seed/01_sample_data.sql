-- Insert sample exercises
INSERT INTO public.exercises (name, description, category, equipment, difficulty, muscle_groups, instructions, calories_per_minute) VALUES
-- Strength exercises
('Push-ups', 'Classic bodyweight exercise for chest, shoulders, and triceps', 'strength', '{}', 'beginner', '{"chest", "shoulders", "triceps"}', '{"Start in plank position", "Lower body until chest nearly touches floor", "Push back up to starting position"}', 8.0),
('Squats', 'Fundamental lower body exercise', 'strength', '{}', 'beginner', '{"quadriceps", "glutes", "hamstrings"}', '{"Stand with feet shoulder-width apart", "Lower body as if sitting back into chair", "Return to standing position"}', 6.0),
('Pull-ups', 'Upper body pulling exercise', 'strength', '{"pull-up bar"}', 'intermediate', '{"lats", "biceps", "rhomboids"}', '{"Hang from bar with overhand grip", "Pull body up until chin clears bar", "Lower with control"}', 10.0),
('Deadlifts', 'Hip hinge movement for posterior chain', 'strength', '{"barbell", "dumbbells"}', 'intermediate', '{"hamstrings", "glutes", "erector spinae"}', '{"Stand with feet hip-width apart", "Hinge at hips to lower weight", "Drive hips forward to stand up"}', 12.0),
('Bench Press', 'Horizontal pushing exercise', 'strength', '{"barbell", "bench"}', 'intermediate', '{"chest", "shoulders", "triceps"}', '{"Lie on bench with bar over chest", "Lower bar to chest", "Press up to starting position"}', 10.0),

-- Cardio exercises
('Running', 'High-intensity cardiovascular exercise', 'cardio', '{}', 'beginner', '{"legs", "core"}', '{"Maintain steady pace", "Land on forefoot", "Keep posture upright"}', 15.0),
('Jumping Jacks', 'Full-body cardio movement', 'cardio', '{}', 'beginner', '{"legs", "shoulders", "core"}', '{"Start standing", "Jump feet apart while raising arms", "Jump back to starting position"}', 8.0),
('Burpees', 'High-intensity full-body exercise', 'cardio', '{}', 'advanced', '{"full body"}', '{"Start standing", "Drop to push-up position", "Do push-up", "Jump feet to hands", "Jump up with arms overhead"}', 20.0),
('Mountain Climbers', 'Dynamic core and cardio exercise', 'cardio', '{}', 'intermediate', '{"core", "shoulders", "legs"}', '{"Start in plank position", "Alternate bringing knees to chest", "Maintain plank position"}', 12.0),

-- Flexibility exercises
('Downward Dog', 'Yoga pose for full-body stretch', 'flexibility', '{}', 'beginner', '{"hamstrings", "calves", "shoulders"}', '{"Start on hands and knees", "Tuck toes and lift hips up", "Straighten legs and arms"}', 3.0),
('Warrior III', 'Balancing yoga pose', 'flexibility', '{}', 'intermediate', '{"legs", "core", "glutes"}', '{"Stand on one leg", "Hinge forward while lifting other leg", "Extend arms forward for balance"}', 4.0),
('Pigeon Pose', 'Hip-opening stretch', 'flexibility', '{}', 'intermediate', '{"hip flexors", "glutes"}', '{"Start in downward dog", "Bring one knee forward", "Extend other leg back", "Lower to forearms"}', 2.0),

-- Sport-specific exercises
('Surfing Pop-up', 'Surfing-specific movement', 'sport_specific', '{}', 'intermediate', '{"core", "shoulders", "legs"}', '{"Start lying on stomach", "Push up quickly to standing", "Land in surf stance"}', 8.0),
('Boxing Jab-Cross', 'Boxing combination', 'sport_specific', '{}', 'beginner', '{"shoulders", "core", "legs"}', '{"Start in boxing stance", "Throw straight punch with lead hand", "Follow with cross punch"}', 10.0),
('Soccer Ball Control', 'Soccer ball handling drill', 'sport_specific', '{"soccer ball"}', 'beginner', '{"legs", "core"}', '{"Keep ball close to feet", "Use both feet", "Maintain control while moving"}', 6.0);

-- Insert sample meals
INSERT INTO public.meals (name, description, calories, protein, carbs, fat, fiber, ingredients, instructions, prep_time_minutes, meal_type) VALUES
-- Breakfast meals
('Oatmeal with Berries', 'Nutritious breakfast with complex carbs and antioxidants', 350, 12.0, 55.0, 8.0, 8.0, '{"oats", "blueberries", "strawberries", "almonds", "honey"}', '{"Cook oats with water", "Top with berries and almonds", "Drizzle with honey"}', 10, 'breakfast'),
('Greek Yogurt Parfait', 'High-protein breakfast with layers of goodness', 280, 20.0, 25.0, 8.0, 4.0, '{"greek yogurt", "granola", "banana", "walnuts"}', '{"Layer yogurt in glass", "Add granola and banana slices", "Top with walnuts"}', 5, 'breakfast'),
('Avocado Toast', 'Simple and satisfying breakfast', 320, 12.0, 35.0, 15.0, 12.0, '{"whole grain bread", "avocado", "lemon", "salt", "pepper", "eggs"}', '{"Toast bread", "Mash avocado with lemon", "Top with poached egg"}', 8, 'breakfast'),

-- Lunch meals
('Grilled Chicken Salad', 'Lean protein with fresh vegetables', 420, 35.0, 20.0, 22.0, 8.0, '{"chicken breast", "mixed greens", "tomatoes", "cucumber", "olive oil", "balsamic vinegar"}', '{"Grill chicken breast", "Chop vegetables", "Toss with dressing"}', 15, 'lunch'),
('Quinoa Buddha Bowl', 'Plant-based protein powerhouse', 450, 18.0, 55.0, 16.0, 10.0, '{"quinoa", "chickpeas", "sweet potato", "kale", "tahini"}', '{"Cook quinoa", "Roast sweet potato", "Massage kale", "Combine with tahini dressing"}', 20, 'lunch'),
('Turkey Wrap', 'Portable and protein-rich lunch', 380, 25.0, 35.0, 15.0, 6.0, '{"whole wheat tortilla", "turkey breast", "lettuce", "tomato", "hummus"}', '{"Spread hummus on tortilla", "Add turkey and vegetables", "Roll tightly"}', 5, 'lunch'),

-- Dinner meals
('Salmon with Roasted Vegetables', 'Omega-3 rich dinner', 520, 35.0, 30.0, 28.0, 8.0, '{"salmon fillet", "broccoli", "carrots", "olive oil", "herbs"}', '{"Season salmon", "Roast vegetables", "Bake salmon until flaky"}', 25, 'dinner'),
('Lentil Curry', 'Plant-based protein with warming spices', 480, 22.0, 65.0, 12.0, 15.0, '{"red lentils", "coconut milk", "curry spices", "onion", "garlic", "ginger"}', '{"Sauté aromatics", "Add lentils and spices", "Simmer with coconut milk"}', 30, 'dinner'),
('Beef Stir-fry', 'Quick and nutritious dinner', 450, 30.0, 25.0, 20.0, 6.0, '{"lean beef", "bell peppers", "broccoli", "soy sauce", "garlic", "ginger"}', '{"Slice beef thinly", "Stir-fry vegetables", "Add beef and sauce"}', 15, 'dinner'),

-- Snacks
('Apple with Almond Butter', 'Balanced snack with healthy fats', 200, 6.0, 25.0, 10.0, 5.0, '{"apple", "almond butter"}', '{"Slice apple", "Serve with almond butter"}', 2, 'snack'),
('Protein Smoothie', 'Post-workout recovery drink', 250, 25.0, 20.0, 8.0, 4.0, '{"protein powder", "banana", "almond milk", "spinach", "berries"}', '{"Blend all ingredients", "Add ice if desired"}', 5, 'snack'),
('Greek Yogurt with Nuts', 'High-protein snack', 180, 15.0, 12.0, 8.0, 2.0, '{"greek yogurt", "mixed nuts", "honey"}', '{"Top yogurt with nuts", "Drizzle with honey"}', 2, 'snack'),

-- Pre-workout meals
('Banana with Peanut Butter', 'Quick energy before workout', 220, 8.0, 30.0, 8.0, 4.0, '{"banana", "peanut butter"}', '{"Slice banana", "Spread with peanut butter"}', 2, 'pre_workout'),
('Oat Energy Ball', 'Portable pre-workout fuel', 180, 6.0, 25.0, 6.0, 4.0, '{"oats", "dates", "almonds", "coconut"}', '{"Blend ingredients", "Form into balls", "Chill"}', 10, 'pre_workout'),

-- Post-workout meals
('Chocolate Protein Shake', 'Recovery drink with carbs and protein', 300, 30.0, 25.0, 8.0, 3.0, '{"chocolate protein powder", "banana", "milk", "cocoa powder"}', '{"Blend all ingredients", "Serve immediately"}', 3, 'post_workout'),
('Chicken and Rice Bowl', 'Classic post-workout meal', 480, 35.0, 45.0, 12.0, 3.0, '{"chicken breast", "brown rice", "vegetables", "soy sauce"}', '{"Cook rice", "Grill chicken", "Steam vegetables", "Combine"}', 20, 'post_workout');

-- Insert sample workout plans
INSERT INTO public.workout_plans (user_id, name, description, duration_minutes, difficulty, is_ai_generated) VALUES
('00000000-0000-0000-0000-000000000000', 'Beginner Full Body', 'Complete full-body workout for beginners', 45, 'beginner', false),
('00000000-0000-0000-0000-000000000000', 'HIIT Cardio Blast', 'High-intensity interval training', 30, 'intermediate', false),
('00000000-0000-0000-0000-000000000000', 'Upper Body Strength', 'Focused upper body strength training', 60, 'intermediate', false),
('00000000-0000-0000-0000-000000000000', 'Yoga Flow', 'Gentle yoga sequence for flexibility', 40, 'beginner', false),
('00000000-0000-0000-0000-000000000000', 'Surfing Prep', 'Sport-specific training for surfing', 50, 'intermediate', false);

-- Insert sample nutrition plans
INSERT INTO public.nutrition_plans (user_id, name, description, daily_calories, daily_protein, daily_carbs, daily_fat, daily_fiber, is_ai_generated) VALUES
('00000000-0000-0000-0000-000000000000', 'Weight Loss Plan', 'Balanced diet for healthy weight loss', 1800, 120.0, 180.0, 60.0, 30.0, false),
('00000000-0000-0000-0000-000000000000', 'Muscle Building', 'High-protein plan for muscle gain', 2500, 180.0, 250.0, 80.0, 35.0, false),
('00000000-0000-0000-0000-000000000000', 'Athlete Performance', 'Optimized nutrition for athletic performance', 3000, 150.0, 400.0, 100.0, 40.0, false),
('00000000-0000-0000-0000-000000000000', 'Plant-Based', 'Complete plant-based nutrition plan', 2200, 100.0, 300.0, 70.0, 50.0, false);