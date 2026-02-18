# Database Setup for Attune

This document describes the database tables required for the Attune app.

## Required Tables

### 1. water_logs

The `water_logs` table stores water intake logs for users.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ounces INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date 
ON public.water_logs(user_id, created_at DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own water logs
CREATE POLICY "Users can view own water logs" 
ON public.water_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own water logs
CREATE POLICY "Users can insert own water logs" 
ON public.water_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own water logs
CREATE POLICY "Users can delete own water logs" 
ON public.water_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 2. food_logs

The `food_logs` table stores food intake logs with AI-estimated nutritional data.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  text TEXT NOT NULL,
  meal_tag TEXT,
  calories_min INTEGER NOT NULL,
  calories_max INTEGER NOT NULL,
  protein_g DECIMAL(10, 2) NOT NULL,
  carbs_g DECIMAL(10, 2) NOT NULL,
  fat_g DECIMAL(10, 2) NOT NULL,
  fiber_g DECIMAL(10, 2) NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high'))
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date 
ON public.food_logs(user_id, timestamp DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own food logs
CREATE POLICY "Users can view own food logs" 
ON public.food_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert own food logs
CREATE POLICY "Users can insert own food logs" 
ON public.food_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own food logs
CREATE POLICY "Users can delete own food logs" 
ON public.food_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 3. movement_logs

The `movement_logs` table stores physical activity logs.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.movement_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity_type TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  intensity TEXT,
  estimated_burn_min INTEGER NOT NULL,
  estimated_burn_max INTEGER NOT NULL
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_movement_logs_user_date 
ON public.movement_logs(user_id, timestamp DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own movement logs
CREATE POLICY "Users can view own movement logs" 
ON public.movement_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert own movement logs
CREATE POLICY "Users can insert own movement logs" 
ON public.movement_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own movement logs
CREATE POLICY "Users can delete own movement logs" 
ON public.movement_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 4. sleep_logs

The `sleep_logs` table stores sleep quality tracking.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  hours_slept DECIMAL(4, 2),
  notes TEXT
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date 
ON public.sleep_logs(user_id, timestamp DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own sleep logs
CREATE POLICY "Users can view own sleep logs" 
ON public.sleep_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert own sleep logs
CREATE POLICY "Users can insert own sleep logs" 
ON public.sleep_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own sleep logs
CREATE POLICY "Users can delete own sleep logs" 
ON public.sleep_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 5. stress_logs

The `stress_logs` table stores stress level tracking.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.stress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_date 
ON public.stress_logs(user_id, timestamp DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.stress_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own stress logs
CREATE POLICY "Users can view own stress logs" 
ON public.stress_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert own stress logs
CREATE POLICY "Users can insert own stress logs" 
ON public.stress_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own stress logs
CREATE POLICY "Users can delete own stress logs" 
ON public.stress_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 6. craving_logs

The `craving_logs` table stores craving tracking with AI-generated suggestions.

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.craving_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  craving_text TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  craving_category TEXT,
  suggestion_text TEXT NOT NULL
);

-- Index for faster queries by user_id and date
CREATE INDEX IF NOT EXISTS idx_craving_logs_user_date 
ON public.craving_logs(user_id, timestamp DESC);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS
ALTER TABLE public.craving_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own craving logs
CREATE POLICY "Users can view own craving logs" 
ON public.craving_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert own craving logs
CREATE POLICY "Users can insert own craving logs" 
ON public.craving_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own craving logs
CREATE POLICY "Users can delete own craving logs" 
ON public.craving_logs 
FOR DELETE 
USING (auth.uid() = user_id);
```

## How to Create Tables

### Option 1: Create All Tables at Once

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor (left sidebar)
3. Click **New Query**
4. Copy and paste ALL the SQL from sections 1-6 above (both table creation and RLS policies)
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success: You should see "Success. No rows returned"

### Option 2: Create Tables Individually

Follow the same steps but copy and paste each table's SQL (structure + RLS policies) separately.

## Verification

After running the SQL commands, verify your tables:

1. Go to **Table Editor** in your Supabase Dashboard
2. You should see all 6 tables listed:
   - `water_logs`
   - `food_logs`
   - `movement_logs`
   - `sleep_logs`
   - `stress_logs`
   - `craving_logs`
3. Click on each table to verify the columns match the schema above
4. Go to **Authentication** → **Policies** to verify RLS policies are enabled

## Notes

- The `kv_store_3253d8ee` table is automatically managed and should not be modified
- All tables use UUID for primary keys and reference `auth.users(id)` for user_id
- RLS policies ensure users can only access their own data
- Indexes are created on `user_id` and timestamp columns for optimal query performance
- All timestamps use `TIMESTAMPTZ` to store timezone-aware dates
- Numeric fields use `INTEGER` or `DECIMAL` as appropriate for the data type