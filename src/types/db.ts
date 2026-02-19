export type MealTag = "Breakfast" | "Lunch" | "Dinner" | "Snack" | null;
export type Confidence = "low" | "medium" | "high";

export interface FoodLog {
  id: string;
  user_id: string;
  timestamp: string;
  text: string;
  meal_tag: MealTag;
  calories_min: number | null;
  calories_max: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  confidence: Confidence | null;
  supportive_note: string | null;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  timestamp: string;
  ounces: number;
  created_at: string;
}

export interface CravingLog {
  id: string;
  user_id: string;
  timestamp: string;
  craving_text: string;
  intensity: number | null;
  craving_category: string | null;
  suggestion_text: string | null;
  alternatives_json: Record<string, unknown> | null;
  created_at: string;
}

export interface MovementLog {
  id: string;
  user_id: string;
  timestamp: string;
  activity_type: string | null;
  duration_min: number | null;
  intensity: string | null;
  estimated_burn_min: number | null;
  estimated_burn_max: number | null;
  supportive_note: string | null;
  raw_text: string | null;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  timestamp: string;
  sleep_quality: number;
  hours_slept: number | null;
  notes: string | null;
  created_at: string;
}

export interface StressLog {
  id: string;
  user_id: string;
  timestamp: string;
  stress_level: number;
  notes: string | null;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  dietary_vegetarian: boolean;
  avoid_weight_language: boolean;
  units_oz: boolean;
  updated_at: string;
}

export interface DailyRollup {
  date: string;
  user_id: string;
  calories_min_total: number;
  calories_max_total: number;
  protein_total: number;
  fiber_total: number;
  carbs_total: number;
  fat_total: number;
  sugar_total: number;
  water_total: number;
  movement_min_total: number;
  burn_min_total: number;
  burn_max_total: number;
  cravings_count: number;
  cravings_avg_intensity: number | null;
  sleep_quality_avg: number | null;
  stress_level_avg: number | null;
}
