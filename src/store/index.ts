import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { userSlice } from './slices/userSlice';
import { workoutSlice } from './slices/workoutSlice';
import { nutritionSlice } from './slices/nutritionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    workout: workoutSlice.reducer,
    nutrition: nutritionSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;