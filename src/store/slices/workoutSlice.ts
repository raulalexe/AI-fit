import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sport_specific';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscle_groups: string[];
  instructions: string[];
  video_url?: string;
  image_url?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  workout_plan_id: string;
  started_at: string;
  completed_at?: string;
  exercises_completed: number;
  total_exercises: number;
  notes?: string;
}

interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  sessions: WorkoutSession[];
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  currentPlan: null,
  sessions: [],
  exercises: [],
  isLoading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentPlan: (state, action: PayloadAction<WorkoutPlan | null>) => {
      state.currentPlan = action.payload;
    },
    setSessions: (state, action: PayloadAction<WorkoutSession[]>) => {
      state.sessions = action.payload;
    },
    addSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<WorkoutSession> }>) => {
      const session = state.sessions.find(s => s.id === action.payload.id);
      if (session) {
        Object.assign(session, action.payload.updates);
      }
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
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
  setSessions,
  addSession,
  updateSession,
  setExercises,
  setError,
  clearError,
} = workoutSlice.actions;

export default workoutSlice;