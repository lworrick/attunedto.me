import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as storage from '../services/storage';
import { 
  waterLogsApi, 
  foodLogsApi, 
  movementLogsApi, 
  sleepLogsApi, 
  stressLogsApi, 
  cravingLogsApi 
} from '../services/supabase';

interface DataContextType {
  foodLogs: storage.FoodLog[];
  waterLogs: storage.WaterLog[];
  cravingLogs: storage.CravingLog[];
  movementLogs: storage.MovementLog[];
  sleepLogs: storage.SleepLog[];
  stressLogs: storage.StressLog[];
  settings: storage.Settings;
  refreshData: () => void;
  addFoodLog: (log: Omit<storage.FoodLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addWaterLog: (ounces: number) => Promise<void>;
  addCravingLog: (log: Omit<storage.CravingLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addMovementLog: (log: Omit<storage.MovementLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addSleepLog: (log: Omit<storage.SleepLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addStressLog: (log: Omit<storage.StressLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  deleteWaterLog: (id: string) => Promise<void>;
  deleteCravingLog: (id: string) => Promise<void>;
  deleteMovementLog: (id: string) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  deleteStressLog: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<storage.Settings>) => void;
  getTodayRollup: () => storage.DailyRollup;
  getRollups: (days: number) => storage.DailyRollup[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [foodLogs, setFoodLogs] = useState<storage.FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<storage.WaterLog[]>([]);
  const [cravingLogs, setCravingLogs] = useState<storage.CravingLog[]>([]);
  const [movementLogs, setMovementLogs] = useState<storage.MovementLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<storage.SleepLog[]>([]);
  const [stressLogs, setStressLogs] = useState<storage.StressLog[]>([]);
  const [settings, setSettings] = useState<storage.Settings>({
    vegetarian: false,
    avoidWeightFocused: true,
    units: 'oz',
  });

  const refreshData = useCallback(async () => {
    // Don't fetch if auth is still loading
    if (authLoading) return;
    
    // Don't fetch if user is not authenticated
    if (!user) return;

    // Load water logs from Supabase
    try {
      const waterData = await waterLogsApi.getAll();
      setWaterLogs(waterData);
    } catch (error) {
      console.error('Error loading water logs:', error);
    }

    // Load other logs from Supabase
    try {
      const foodData = await foodLogsApi.getAll();
      setFoodLogs(foodData);
    } catch (error) {
      console.error('Error loading food logs:', error);
    }

    try {
      const movementData = await movementLogsApi.getAll();
      setMovementLogs(movementData);
    } catch (error) {
      console.error('Error loading movement logs:', error);
    }

    try {
      const sleepData = await sleepLogsApi.getAll();
      setSleepLogs(sleepData);
    } catch (error) {
      console.error('Error loading sleep logs:', error);
    }

    try {
      const stressData = await stressLogsApi.getAll();
      setStressLogs(stressData);
    } catch (error) {
      console.error('Error loading stress logs:', error);
    }

    try {
      const cravingData = await cravingLogsApi.getAll();
      setCravingLogs(cravingData);
    } catch (error) {
      console.error('Error loading craving logs:', error);
    }

    // Load settings from localStorage (temporary)
    setSettings(storage.getSettings(user.id));
  }, [user, authLoading]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addFoodLog = async (log: Omit<storage.FoodLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await foodLogsApi.create(log);
      await refreshData();
    } catch (error) {
      console.error('Error adding food log:', error);
      throw error;
    }
  };

  const addWaterLog = async (ounces: number) => {
    if (!user) return;
    try {
      await waterLogsApi.create(ounces);
      await refreshData();
    } catch (error) {
      console.error('Error adding water log:', error);
      throw error;
    }
  };

  const addCravingLog = async (log: Omit<storage.CravingLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await cravingLogsApi.create(log);
      await refreshData();
    } catch (error) {
      console.error('Error adding craving log:', error);
      throw error;
    }
  };

  const addMovementLog = async (log: Omit<storage.MovementLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await movementLogsApi.create(log);
      await refreshData();
    } catch (error) {
      console.error('Error adding movement log:', error);
      throw error;
    }
  };

  const addSleepLog = async (log: Omit<storage.SleepLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await sleepLogsApi.create(log);
      await refreshData();
    } catch (error) {
      console.error('Error adding sleep log:', error);
      throw error;
    }
  };

  const addStressLog = async (log: Omit<storage.StressLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await stressLogsApi.create(log);
      await refreshData();
    } catch (error) {
      console.error('Error adding stress log:', error);
      throw error;
    }
  };

  const deleteFoodLog = async (id: string) => {
    try {
      await foodLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting food log:', error);
      throw error;
    }
  };

  const deleteWaterLog = async (id: string) => {
    try {
      await waterLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting water log:', error);
      throw error;
    }
  };

  const deleteCravingLog = async (id: string) => {
    try {
      await cravingLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting craving log:', error);
      throw error;
    }
  };

  const deleteMovementLog = async (id: string) => {
    try {
      await movementLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting movement log:', error);
      throw error;
    }
  };

  const deleteSleepLog = async (id: string) => {
    try {
      await sleepLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting sleep log:', error);
      throw error;
    }
  };

  const deleteStressLog = async (id: string) => {
    try {
      await stressLogsApi.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting stress log:', error);
      throw error;
    }
  };

  const updateSettings = (updates: Partial<storage.Settings>) => {
    if (!user) return;
    storage.updateSettings(user.id, updates);
    refreshData();
  };

  const getTodayRollup = (): storage.DailyRollup => {
    if (!user) {
      return {
        date: new Date().toISOString().split('T')[0],
        user_id: '',
        calories_min_total: 0,
        calories_max_total: 0,
        protein_total: 0,
        carbs_total: 0,
        fat_total: 0,
        fiber_total: 0,
        water_total: 0,
        movement_min_total: 0,
        burn_min_total: 0,
        burn_max_total: 0,
        cravings_count: 0,
        cravings_avg_intensity: 0,
        sleep_quality_avg: 0,
        stress_level_avg: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Filter all logs for today
    const todayFoodLogs = foodLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    const todayWaterLogs = waterLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    const todayCravingLogs = cravingLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    const todayMovementLogs = movementLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    const todaySleepLogs = sleepLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    const todayStressLogs = stressLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    // Calculate totals from Supabase data
    const calories_min_total = todayFoodLogs.reduce((sum, log) => sum + log.calories_min, 0);
    const calories_max_total = todayFoodLogs.reduce((sum, log) => sum + log.calories_max, 0);
    const protein_total = todayFoodLogs.reduce((sum, log) => sum + log.protein_g, 0);
    const carbs_total = todayFoodLogs.reduce((sum, log) => sum + log.carbs_g, 0);
    const fat_total = todayFoodLogs.reduce((sum, log) => sum + log.fat_g, 0);
    const fiber_total = todayFoodLogs.reduce((sum, log) => sum + log.fiber_g, 0);
    const water_total = todayWaterLogs.reduce((sum, log) => sum + log.ounces, 0);
    const movement_min_total = todayMovementLogs.reduce((sum, log) => sum + log.duration_min, 0);
    const burn_min_total = todayMovementLogs.reduce((sum, log) => sum + log.estimated_burn_min, 0);
    const burn_max_total = todayMovementLogs.reduce((sum, log) => sum + log.estimated_burn_max, 0);
    const cravings_count = todayCravingLogs.length;
    const cravings_avg_intensity = cravings_count > 0
      ? todayCravingLogs.reduce((sum, log) => sum + log.intensity, 0) / cravings_count
      : 0;
    const sleep_quality_avg = todaySleepLogs.length > 0
      ? todaySleepLogs.reduce((sum, log) => sum + log.sleep_quality, 0) / todaySleepLogs.length
      : 0;
    const stress_level_avg = todayStressLogs.length > 0
      ? todayStressLogs.reduce((sum, log) => sum + log.stress_level, 0) / todayStressLogs.length
      : 0;

    return {
      date: today,
      user_id: user.id,
      calories_min_total,
      calories_max_total,
      protein_total,
      carbs_total,
      fat_total,
      fiber_total,
      water_total,
      movement_min_total,
      burn_min_total,
      burn_max_total,
      cravings_count,
      cravings_avg_intensity,
      sleep_quality_avg,
      stress_level_avg,
    };
  };

  const getRollups = (days: number): storage.DailyRollup[] => {
    if (!user) return [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const rollups: storage.DailyRollup[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      // Filter all logs for this day
      const dayFoodLogs = foodLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      const dayWaterLogs = waterLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      const dayCravingLogs = cravingLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      const dayMovementLogs = movementLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      const daySleepLogs = sleepLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      const dayStressLogs = stressLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= startOfDay && logDate <= endOfDay;
      });

      // Calculate totals from Supabase data
      const calories_min_total = dayFoodLogs.reduce((sum, log) => sum + log.calories_min, 0);
      const calories_max_total = dayFoodLogs.reduce((sum, log) => sum + log.calories_max, 0);
      const protein_total = dayFoodLogs.reduce((sum, log) => sum + log.protein_g, 0);
      const carbs_total = dayFoodLogs.reduce((sum, log) => sum + log.carbs_g, 0);
      const fat_total = dayFoodLogs.reduce((sum, log) => sum + log.fat_g, 0);
      const fiber_total = dayFoodLogs.reduce((sum, log) => sum + log.fiber_g, 0);
      const water_total = dayWaterLogs.reduce((sum, log) => sum + log.ounces, 0);
      const movement_min_total = dayMovementLogs.reduce((sum, log) => sum + log.duration_min, 0);
      const burn_min_total = dayMovementLogs.reduce((sum, log) => sum + log.estimated_burn_min, 0);
      const burn_max_total = dayMovementLogs.reduce((sum, log) => sum + log.estimated_burn_max, 0);
      const cravings_count = dayCravingLogs.length;
      const cravings_avg_intensity = cravings_count > 0
        ? dayCravingLogs.reduce((sum, log) => sum + log.intensity, 0) / cravings_count
        : 0;
      const sleep_quality_avg = daySleepLogs.length > 0
        ? daySleepLogs.reduce((sum, log) => sum + log.sleep_quality, 0) / daySleepLogs.length
        : 0;
      const stress_level_avg = dayStressLogs.length > 0
        ? dayStressLogs.reduce((sum, log) => sum + log.stress_level, 0) / dayStressLogs.length
        : 0;

      rollups.push({
        date: dateStr,
        user_id: user.id,
        calories_min_total,
        calories_max_total,
        protein_total,
        carbs_total,
        fat_total,
        fiber_total,
        water_total,
        movement_min_total,
        burn_min_total,
        burn_max_total,
        cravings_count,
        cravings_avg_intensity,
        sleep_quality_avg,
        stress_level_avg,
      });

      current.setDate(current.getDate() + 1);
    }

    return rollups;
  };

  return (
    <DataContext.Provider
      value={{
        foodLogs,
        waterLogs,
        cravingLogs,
        movementLogs,
        sleepLogs,
        stressLogs,
        settings,
        refreshData,
        addFoodLog,
        addWaterLog,
        addCravingLog,
        addMovementLog,
        addSleepLog,
        addStressLog,
        deleteFoodLog,
        deleteWaterLog,
        deleteCravingLog,
        deleteMovementLog,
        deleteSleepLog,
        deleteStressLog,
        updateSettings,
        getTodayRollup,
        getRollups,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};