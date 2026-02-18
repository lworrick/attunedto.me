// Supabase API service for Attune
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create Supabase client for frontend
export const supabase = createClient(supabaseUrl, publicAnonKey);

// Base URL for server API calls
const serverUrl = `${supabaseUrl}/functions/v1/make-server-3253d8ee`;

// Helper to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Auth API
export const authApi = {
  // Sign up a new user via server
  async signUp(email: string, password: string) {
    const response = await fetch(`${serverUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error signing up:', errorData);
      throw new Error(errorData.error || 'Failed to sign up');
    }

    const data = await response.json();
    console.log('Signup successful, now signing in...');
    
    // After successful signup, sign in to get a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Error signing in after signup:', signInError);
      throw new Error('Account created but sign in failed. Please try signing in manually.');
    }

    return {
      user: data.user,
      session: signInData.session,
    };
  },
};

// Water Logs API
export const waterLogsApi = {
  // Create a new water log directly in Supabase
  async create(ounces: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        ounces: ounces,
        // created_at will be set automatically by database default
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating water log:', error);
      throw new Error(error.message || 'Failed to create water log');
    }

    return data;
  },

  // Get all water logs for the user directly from Supabase
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching water logs:', error);
      throw new Error(error.message || 'Failed to fetch water logs');
    }

    return data || [];
  },

  // Get total ounces for today
  async getTodayTotal() {
    const logs = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayLogs = logs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startOfDay && logDate <= endOfDay;
    });
    
    return todayLogs.reduce((total, log) => total + log.ounces, 0);
  },

  // Delete a water log directly from Supabase
  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own logs

    if (error) {
      console.error('Error deleting water log:', error);
      throw new Error(error.message || 'Failed to delete water log');
    }

    return { success: true };
  },
};

// Food Logs API
export const foodLogsApi = {
  async create(log: {
    text: string;
    meal_tag?: string;
    calories_min: number;
    calories_max: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    confidence: 'low' | 'medium' | 'high';
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        text: log.text,
        meal_tag: log.meal_tag,
        calories_min: log.calories_min,
        calories_max: log.calories_max,
        protein_g: log.protein_g,
        carbs_g: log.carbs_g,
        fat_g: log.fat_g,
        fiber_g: log.fiber_g,
        confidence: log.confidence,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating food log:', error);
      throw new Error(error.message || 'Failed to create food log');
    }

    return data;
  },

  async getAll(date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching food logs:', error);
      throw new Error(error.message || 'Failed to fetch food logs');
    }

    return data || [];
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting food log:', error);
      throw new Error(error.message || 'Failed to delete food log');
    }

    return { success: true };
  },
};

// Movement Logs API
export const movementLogsApi = {
  async create(log: {
    activity_type: string;
    duration_min: number;
    intensity?: string;
    estimated_burn_min: number;
    estimated_burn_max: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('movement_logs')
      .insert({
        user_id: user.id,
        activity_type: log.activity_type,
        duration_min: log.duration_min,
        intensity: log.intensity,
        estimated_burn_min: log.estimated_burn_min,
        estimated_burn_max: log.estimated_burn_max,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating movement log:', error);
      throw new Error(error.message || 'Failed to create movement log');
    }

    return data;
  },

  async getAll(date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('movement_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching movement logs:', error);
      throw new Error(error.message || 'Failed to fetch movement logs');
    }

    return data || [];
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('movement_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting movement log:', error);
      throw new Error(error.message || 'Failed to delete movement log');
    }

    return { success: true };
  },
};

// Sleep Logs API
export const sleepLogsApi = {
  async create(log: {
    sleep_quality: number;
    hours_slept?: number;
    notes?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert({
        user_id: user.id,
        sleep_quality: log.sleep_quality,
        hours_slept: log.hours_slept,
        notes: log.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sleep log:', error);
      throw new Error(error.message || 'Failed to create sleep log');
    }

    return data;
  },

  async getAll(date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sleep logs:', error);
      throw new Error(error.message || 'Failed to fetch sleep logs');
    }

    return data || [];
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting sleep log:', error);
      throw new Error(error.message || 'Failed to delete sleep log');
    }

    return { success: true };
  },
};

// Stress Logs API
export const stressLogsApi = {
  async create(log: {
    stress_level: number;
    notes?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('stress_logs')
      .insert({
        user_id: user.id,
        stress_level: log.stress_level,
        notes: log.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating stress log:', error);
      throw new Error(error.message || 'Failed to create stress log');
    }

    return data;
  },

  async getAll(date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('stress_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stress logs:', error);
      throw new Error(error.message || 'Failed to fetch stress logs');
    }

    return data || [];
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('stress_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting stress log:', error);
      throw new Error(error.message || 'Failed to delete stress log');
    }

    return { success: true };
  },
};

// Craving Logs API
export const cravingLogsApi = {
  async create(log: {
    craving_text: string;
    intensity: number;
    craving_category?: string;
    suggestion_text: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('craving_logs')
      .insert({
        user_id: user.id,
        craving_text: log.craving_text,
        intensity: log.intensity,
        craving_category: log.craving_category,
        suggestion_text: log.suggestion_text,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating craving log:', error);
      throw new Error(error.message || 'Failed to create craving log');
    }

    return data;
  },

  async getAll(date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('craving_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching craving logs:', error);
      throw new Error(error.message || 'Failed to fetch craving logs');
    }

    return data || [];
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('craving_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting craving log:', error);
      throw new Error(error.message || 'Failed to delete craving log');
    }

    return { success: true };
  },
};

// Daily Rollups API
export const dailyRollupsApi = {
  // Get daily rollup for a specific date (defaults to today)
  async getByDate(date?: string) {
    // Check session first to ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Use today's date if not provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_rollups')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('day', targetDate)
      .single();

    if (error) {
      // If no row exists for today, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching daily rollup:', error);
      throw new Error(error.message || 'Failed to fetch daily rollup');
    }

    return data;
  },

  // Get daily rollups for a date range
  async getRange(startDate: string, endDate: string) {
    // Check session first to ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('daily_rollups')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('day', startDate)
      .lte('day', endDate)
      .order('day', { ascending: true });

    if (error) {
      console.error('Error fetching daily rollups range:', error);
      throw new Error(error.message || 'Failed to fetch daily rollups');
    }

    return data || [];
  },
};