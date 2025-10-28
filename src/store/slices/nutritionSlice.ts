import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  instructions: string[];
  prep_time_minutes: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  image_url?: string;
}

export interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  meals: Meal[];
  created_at: string;
  updated_at: string;
}

export interface NutritionLog {
  id: string;
  meal_id: string;
  consumed_at: string;
  quantity: number;
  notes?: string;
}

interface NutritionState {
  currentPlan: NutritionPlan | null;
  logs: NutritionLog[];
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NutritionState = {
  currentPlan: null,
  logs: [],
  meals: [],
  isLoading: false,
  error: null,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentPlan: (state, action: PayloadAction<NutritionPlan | null>) => {
      state.currentPlan = action.payload;
    },
    setLogs: (state, action: PayloadAction<NutritionLog[]>) => {
      state.logs = action.payload;
    },
    addLog: (state, action: PayloadAction<NutritionLog>) => {
      state.logs.push(action.payload);
    },
    setMeals: (state, action: PayloadAction<Meal[]>) => {
      state.meals = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setCurrentPlan,
  setLogs,
  addLog,
  setMeals,
  setError,
  clearError,
} = nutritionSlice.actions;

export default nutritionSlice;