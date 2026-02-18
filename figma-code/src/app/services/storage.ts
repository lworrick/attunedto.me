// Local storage utilities for Attune
// This will be replaced with Supabase when backend is connected

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  created_at: string;
  text: string;
  meal_tag?: string;
  calories_min: number;
  calories_max: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface WaterLog {
  id: string;
  user_id: string;
  created_at: string;
  ounces: number;
}

export interface CravingLog {
  id: string;
  user_id: string;
  created_at: string;
  craving_text: string;
  intensity: number;
  craving_category?: string;
  suggestion_text: string;
}

export interface MovementLog {
  id: string;
  user_id: string;
  created_at: string;
  activity_type: string;
  duration_min: number;
  intensity?: string;
  estimated_burn_min: number;
  estimated_burn_max: number;
}

export interface SleepLog {
  id: string;
  user_id: string;
  created_at: string;
  sleep_quality: number;
  hours_slept?: number;
  notes?: string;
}

export interface StressLog {
  id: string;
  user_id: string;
  created_at: string;
  stress_level: number;
  notes?: string;
}

export interface DailyRollup {
  date: string;
  user_id: string;
  calories_min_total: number;
  calories_max_total: number;
  protein_total: number;
  carbs_total: number;
  fat_total: number;
  fiber_total: number;
  water_total: number;
  movement_min_total: number;
  burn_min_total: number;
  burn_max_total: number;
  cravings_count: number;
  cravings_avg_intensity: number;
  sleep_quality_avg: number;
  stress_level_avg: number;
}

export interface Settings {
  vegetarian: boolean;
  avoidWeightFocused: boolean;
  units: 'oz' | 'ml';
}

const STORAGE_KEYS = {
  CURRENT_USER: 'attune_current_user',
  USERS: 'attune_users',
  FOOD_LOGS: 'attune_food_logs',
  WATER_LOGS: 'attune_water_logs',
  CRAVING_LOGS: 'attune_craving_logs',
  MOVEMENT_LOGS: 'attune_movement_logs',
  SLEEP_LOGS: 'attune_sleep_logs',
  STRESS_LOGS: 'attune_stress_logs',
  SETTINGS: 'attune_settings',
};

// User management
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const createUser = (email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const existingUser = users.find((u: User) => u.email === email);
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find((u: User) => u.email === email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
};

// Generic log functions
const getLogsByType = <T>(key: string, userId: string): T[] => {
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  return logs.filter((log: any) => log.user_id === userId);
};

const addLog = <T extends { id: string; user_id: string }>(
  key: string,
  log: Omit<T, 'id'>,
): T => {
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  const newLog = {
    ...log,
    id: `${key}_${Date.now()}_${Math.random()}`,
  } as T;
  logs.push(newLog);
  localStorage.setItem(key, JSON.stringify(logs));
  return newLog;
};

const updateLog = <T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>,
): T | null => {
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  const index = logs.findIndex((log: T) => log.id === id);
  
  if (index === -1) return null;
  
  logs[index] = { ...logs[index], ...updates };
  localStorage.setItem(key, JSON.stringify(logs));
  return logs[index];
};

const deleteLog = (key: string, id: string): boolean => {
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  const filteredLogs = logs.filter((log: any) => log.id !== id);
  
  if (filteredLogs.length === logs.length) return false;
  
  localStorage.setItem(key, JSON.stringify(filteredLogs));
  return true;
};

// Food logs
export const getFoodLogs = (userId: string) =>
  getLogsByType<FoodLog>(STORAGE_KEYS.FOOD_LOGS, userId);

export const addFoodLog = (log: Omit<FoodLog, 'id'>) =>
  addLog<FoodLog>(STORAGE_KEYS.FOOD_LOGS, log);

export const updateFoodLog = (id: string, updates: Partial<FoodLog>) =>
  updateLog<FoodLog>(STORAGE_KEYS.FOOD_LOGS, id, updates);

export const deleteFoodLog = (id: string) =>
  deleteLog(STORAGE_KEYS.FOOD_LOGS, id);

// Water logs
export const getWaterLogs = (userId: string) =>
  getLogsByType<WaterLog>(STORAGE_KEYS.WATER_LOGS, userId);

export const addWaterLog = (log: Omit<WaterLog, 'id'>) =>
  addLog<WaterLog>(STORAGE_KEYS.WATER_LOGS, log);

export const deleteWaterLog = (id: string) =>
  deleteLog(STORAGE_KEYS.WATER_LOGS, id);

// Craving logs
export const getCravingLogs = (userId: string) =>
  getLogsByType<CravingLog>(STORAGE_KEYS.CRAVING_LOGS, userId);

export const addCravingLog = (log: Omit<CravingLog, 'id'>) =>
  addLog<CravingLog>(STORAGE_KEYS.CRAVING_LOGS, log);

export const deleteCravingLog = (id: string) =>
  deleteLog(STORAGE_KEYS.CRAVING_LOGS, id);

// Movement logs
export const getMovementLogs = (userId: string) =>
  getLogsByType<MovementLog>(STORAGE_KEYS.MOVEMENT_LOGS, userId);

export const addMovementLog = (log: Omit<MovementLog, 'id'>) =>
  addLog<MovementLog>(STORAGE_KEYS.MOVEMENT_LOGS, log);

export const deleteMovementLog = (id: string) =>
  deleteLog(STORAGE_KEYS.MOVEMENT_LOGS, id);

// Sleep logs
export const getSleepLogs = (userId: string) =>
  getLogsByType<SleepLog>(STORAGE_KEYS.SLEEP_LOGS, userId);

export const addSleepLog = (log: Omit<SleepLog, 'id'>) =>
  addLog<SleepLog>(STORAGE_KEYS.SLEEP_LOGS, log);

export const deleteSleepLog = (id: string) =>
  deleteLog(STORAGE_KEYS.SLEEP_LOGS, id);

// Stress logs
export const getStressLogs = (userId: string) =>
  getLogsByType<StressLog>(STORAGE_KEYS.STRESS_LOGS, userId);

export const addStressLog = (log: Omit<StressLog, 'id'>) =>
  addLog<StressLog>(STORAGE_KEYS.STRESS_LOGS, log);

export const deleteStressLog = (id: string) =>
  deleteLog(STORAGE_KEYS.STRESS_LOGS, id);

// Settings
export const getSettings = (userId: string): Settings => {
  const settingsMap = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}',
  );
  return (
    settingsMap[userId] || {
      vegetarian: false,
      avoidWeightFocused: true,
      units: 'oz',
    }
  );
};

export const updateSettings = (userId: string, settings: Partial<Settings>) => {
  const settingsMap = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}',
  );
  settingsMap[userId] = { ...getSettings(userId), ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsMap));
};

// Calculate daily rollup
export const getDailyRollup = (userId: string, date: string): DailyRollup => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const foodLogs = getFoodLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const waterLogs = getWaterLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const cravingLogs = getCravingLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const movementLogs = getMovementLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const sleepLogs = getSleepLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const stressLogs = getStressLogs(userId).filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  return {
    date,
    user_id: userId,
    calories_min_total: foodLogs.reduce((sum, log) => sum + log.calories_min, 0),
    calories_max_total: foodLogs.reduce((sum, log) => sum + log.calories_max, 0),
    protein_total: foodLogs.reduce((sum, log) => sum + log.protein_g, 0),
    carbs_total: foodLogs.reduce((sum, log) => sum + log.carbs_g, 0),
    fat_total: foodLogs.reduce((sum, log) => sum + log.fat_g, 0),
    fiber_total: foodLogs.reduce((sum, log) => sum + log.fiber_g, 0),
    water_total: waterLogs.reduce((sum, log) => sum + log.ounces, 0),
    movement_min_total: movementLogs.reduce(
      (sum, log) => sum + log.duration_min,
      0,
    ),
    burn_min_total: movementLogs.reduce(
      (sum, log) => sum + log.estimated_burn_min,
      0,
    ),
    burn_max_total: movementLogs.reduce(
      (sum, log) => sum + log.estimated_burn_max,
      0,
    ),
    cravings_count: cravingLogs.length,
    cravings_avg_intensity:
      cravingLogs.length > 0
        ? cravingLogs.reduce((sum, log) => sum + log.intensity, 0) /
          cravingLogs.length
        : 0,
    sleep_quality_avg:
      sleepLogs.length > 0
        ? sleepLogs.reduce((sum, log) => sum + log.sleep_quality, 0) /
          sleepLogs.length
        : 0,
    stress_level_avg:
      stressLogs.length > 0
        ? stressLogs.reduce((sum, log) => sum + log.stress_level, 0) /
          stressLogs.length
        : 0,
  };
};

// Get rollups for date range
export const getDailyRollups = (
  userId: string,
  startDate: string,
  endDate: string,
): DailyRollup[] => {
  const rollups: DailyRollup[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    rollups.push(getDailyRollup(userId, dateStr));
    current.setDate(current.getDate() + 1);
  }

  return rollups;
};