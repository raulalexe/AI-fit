import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'sport_performance';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  medical_conditions?: string[];
  available_equipment?: string[];
  created_at: string;
  updated_at: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
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
  setProfile,
  updateProfile,
  setError,
  clearError,
} = userSlice.actions;

export default userSlice;