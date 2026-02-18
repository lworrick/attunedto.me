# Quick Start: Setting Up Attune with Supabase

Follow these steps to get all wellness tracking features working with Supabase:

## Step 1: Create All Database Tables

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this complete SQL script:

```sql
-- ========================================
-- ATTUNE DATABASE SETUP - ALL TABLES
-- ========================================

-- 1. WATER LOGS
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ounces INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, created_at DESC);
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own water logs" ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water logs" ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own water logs" ON public.water_logs FOR DELETE USING (auth.uid() = user_id);

-- 2. FOOD LOGS
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
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, timestamp DESC);
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own food logs" ON public.food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON public.food_logs FOR DELETE USING (auth.uid() = user_id);

-- 3. MOVEMENT LOGS
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
CREATE INDEX IF NOT EXISTS idx_movement_logs_user_date ON public.movement_logs(user_id, timestamp DESC);
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own movement logs" ON public.movement_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movement logs" ON public.movement_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own movement logs" ON public.movement_logs FOR DELETE USING (auth.uid() = user_id);

-- 4. SLEEP LOGS
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  hours_slept DECIMAL(4, 2),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, timestamp DESC);
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sleep logs" ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep logs" ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep logs" ON public.sleep_logs FOR DELETE USING (auth.uid() = user_id);

-- 5. STRESS LOGS
CREATE TABLE IF NOT EXISTS public.stress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_date ON public.stress_logs(user_id, timestamp DESC);
ALTER TABLE public.stress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stress logs" ON public.stress_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stress logs" ON public.stress_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stress logs" ON public.stress_logs FOR DELETE USING (auth.uid() = user_id);

-- 6. CRAVING LOGS
CREATE TABLE IF NOT EXISTS public.craving_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  craving_text TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  craving_category TEXT,
  suggestion_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_craving_logs_user_date ON public.craving_logs(user_id, timestamp DESC);
ALTER TABLE public.craving_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own craving logs" ON public.craving_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own craving logs" ON public.craving_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own craving logs" ON public.craving_logs FOR DELETE USING (auth.uid() = user_id);
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success: You should see "Success. No rows returned"

## Step 2: Verify Tables

1. Go to **Table Editor** in your Supabase Dashboard
2. You should see all 6 tables:
   - ✅ `water_logs`
   - ✅ `food_logs`
   - ✅ `movement_logs`
   - ✅ `sleep_logs`
   - ✅ `stress_logs`
   - ✅ `craving_logs`

## Step 3: Test the App

### 3.1 Sign Up / Sign In
- Create a new account with email/password **OR**
- Try the magic link option for passwordless authentication

### 3.2 Test Each Logging Feature

**Log Water:**
1. Click "Log Water" from home screen
2. Tap a quick amount or enter custom
3. ✅ Success toast should appear
4. ✅ Total should update on home screen

**Log Food:**
1. Click "Log Food" from home screen
2. Enter description: "2 scrambled eggs with toast"
3. Select meal tag (optional)
4. ✅ AI estimates should appear
5. Click "Log It"
6. ✅ Food should appear in today's summary

**Log Movement:**
1. Click "Log Movement" from home screen
2. Enter activity: "30 minute walk"
3. ✅ Duration and calories should be estimated
4. Click "Log It"
5. ✅ Movement should appear in today's summary

**Log Craving:**
1. Click "Log Craving" from home screen
2. Enter craving: "chocolate"
3. Rate intensity (1-10)
4. ✅ Supportive suggestions should appear
5. Choose to honor or try alternative
6. ✅ Craving logged successfully

**Log Sleep:**
1. Click "Log Sleep" from home screen
2. Rate quality (1-5)
3. Enter hours slept (optional)
4. Add notes (optional)
5. ✅ Sleep logged successfully

**Log Stress:**
1. Click "Log Stress" from home screen
2. Rate stress level (1-5)
3. Add context (optional)
4. ✅ Stress logged successfully

### 3.3 Verify Data Display

**Home Screen (Today):**
- ✅ Today's totals show for all categories
- ✅ AI-generated daily summary appears (if you have logs)

**History Screen:**
- ✅ All logs appear organized by date and type
- ✅ Can delete logs
- ✅ Logs grouped by day

**Trends Screen:**
- ✅ Charts show data for 7/30/90 days
- ✅ Correlations between sleep, stress, cravings appear
- ✅ AI insights based on trends

## Step 4: Verify Database

1. Go back to **Table Editor** in Supabase
2. Click on each table to see your logged data
3. Verify that:
   - ✅ `user_id` matches your authenticated user
   - ✅ Timestamps are correct
   - ✅ Data matches what you entered

## Troubleshooting

### "Not authenticated" error
- Make sure you're signed in
- Check browser console for auth errors
- Try signing out and back in

### "Failed to create [log type]" error
- Verify ALL tables were created successfully
- Check that RLS policies are enabled for that table
- Check browser console for specific error messages
- Make sure you ran the complete SQL script from Step 1

### Data not showing up
- Refresh the page to reload data
- Check that the `user_id` in database matches your user
- Open DevTools → Network tab to see API calls
- Check browser console for errors

### Magic link not arriving
- Check spam folder
- Ensure Supabase project has email configured
- Use password authentication as alternative

### AI features not working
- AI responses are mock data for now (not real API calls)
- Food/movement estimation uses placeholder algorithms
- Real AI integration requires API keys (not yet configured)

## What's Working

✅ **Authentication:** Email/password and magic link  
✅ **Database:** All 6 log types stored in Supabase  
✅ **Security:** Row Level Security enforces data isolation  
✅ **UI:** All 11 screens with desert-inspired design  
✅ **Tracking:** Food, water, cravings, movement, sleep, stress  
✅ **History:** View and delete all past logs  
✅ **Trends:** Charts and analytics across 7/30/90 days  

## Next Steps

Once everything is working:
- ✅ Start tracking daily to build your wellness data
- ✅ Explore trends after a few days of logging
- ✅ Adjust settings to customize your experience
- ✅ Note: AI features use mock data until API integration

---

Need help? Check the full documentation:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed table schemas
- [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) - Technical implementation
- [README.md](./README.md) - App overview