/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserGoal = 'lose_weight' | 'build_muscle' | 'stay_fit' | 'general_health';

export interface UserProfile {
  name: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  targetCalories: number;
  goal: UserGoal;
  experience?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutItem {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "12", "8-12", or "30s"
  weight?: number; // e.g. 50 kg
  completed: boolean;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  dayName: string; // e.g., "Dushanba: Ko'krak va Triceps"
  exercises: Omit<WorkoutItem, 'completed'>[];
}

export interface WorkoutLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseName: string;
  sets: number;
  reps: string;
  weight?: number;
  completedAt: string; // timestamp
}

export interface FoodLogItem {
  id: string;
  name: string;
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface WaterLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  intakeMl: number;
}

export interface StepsLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  stepsCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface WorkoutPlanResponse {
  routines: {
    dayName: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      notes?: string;
    }[];
  }[];
  motivation: string;
}

export interface MealAnalysisResponse {
  items: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  summary: string;
}
