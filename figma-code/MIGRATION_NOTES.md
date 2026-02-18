# Water Logging Migration to Direct Supabase Access

## Summary of Changes

This update migrates water logging from server-side API endpoints to direct Supabase client access from the frontend.

## What Changed

### 1. Supabase Service (`/src/app/services/supabase.ts`)

Updated `waterLogsApi` to interact directly with Supabase tables instead of server endpoints:

**Before:**
- Made HTTP requests to `/make-server-3253d8ee/water-logs`
- Required Bearer token in Authorization header
- Server validated JWT and performed database operations

**After:**
- Uses Supabase client directly: `supabase.from('water_logs')`
- Gets authenticated user with `supabase.auth.getUser()`
- Performs database operations client-side with automatic RLS enforcement

### 2. New Methods in `waterLogsApi`

- ✅ `create(ounces)` - Inserts water log with user_id, ounces, created_at
- ✅ `getAll(date?)` - Fetches logs for specific date (or today) filtered by user_id
- ✅ `getTodayTotal()` - Convenience method to sum today's water intake
- ✅ `delete(id)` - Deletes log by id (with user_id verification via RLS)

### 3. Authentication Screen (`/src/app/screens/AuthScreen.tsx`)

Enhanced with magic link support:
- Toggle between password and magic link authentication
- "Send Magic Link" button for passwordless login
- Success/error messages for magic link flow
- Clean UI toggle between auth modes

### 4. Auth Context (`/src/app/contexts/AuthContext.tsx`)

Added magic link authentication method:
```typescript
signInWithMagicLink: (email: string) => Promise<void>
```

Uses `supabase.auth.signInWithOtp()` for passwordless authentication.

### 5. Data Context (`/src/app/contexts/DataContext.tsx`)

Already properly configured:
- Loads water logs from Supabase on refresh
- Uses `waterLogsApi.create()` for new logs
- Uses `waterLogsApi.delete()` for deletions
- Merges water data from Supabase with localStorage data for rollups

### 6. UI Components

All screens already use the DataContext:
- **LogWaterScreen**: Calls `addWaterLog()` which uses Supabase API
- **HomeScreen**: Displays `getTodayRollup()` which includes Supabase water data
- **HistoryScreen**: Shows `waterLogs` from Supabase via DataContext
- **TrendsScreen**: Analyzes `getRollups()` which includes Supabase water data

## Database Requirements

The app requires a `water_logs` table in Supabase:

```sql
CREATE TABLE public.water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ounces INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

With Row Level Security (RLS) policies:
- Users can only SELECT their own water logs
- Users can only INSERT with their own user_id
- Users can only DELETE their own water logs

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete SQL commands.

## Security Benefits

### Before (Server Endpoint Approach):
- JWT token sent in every request
- Server validates token and extracts user_id
- Server performs database operations
- Multiple network hops (client → server → database)

### After (Direct Supabase Access):
- JWT token automatically included by Supabase client
- RLS policies enforce user_id filtering at database level
- Fewer network hops (client → database)
- Supabase handles token validation and user context
- Simpler code with less error handling needed

## What Still Works the Same

- **User Experience**: No changes to UI or user flows
- **Other Log Types**: Food, cravings, movement, sleep, stress still use localStorage
- **Server Endpoints**: `/water-logs` endpoints remain in server (can be removed or kept for future use)
- **Authentication**: Sign up, sign in, sign out all work as before (with added magic link)

## Testing Checklist

- [ ] Sign up with email/password creates user
- [ ] Sign in with email/password works
- [ ] Sign in with magic link sends email
- [ ] After login, can view home screen
- [ ] Can log water via quick buttons
- [ ] Can log water via custom amount
- [ ] Today's water total displays correctly
- [ ] Water logs appear in History screen
- [ ] Can delete water logs
- [ ] Water data appears in Trends charts
- [ ] Sign out clears session and returns to login
- [ ] Refresh page maintains session

## Next Steps

The same pattern can be applied to migrate other log types:
1. Create tables in Supabase (food_logs, craving_logs, etc.)
2. Update service APIs to use direct Supabase access
3. Add RLS policies for each table
4. Update DataContext to load from Supabase
5. Test thoroughly

This establishes the pattern for all future data migrations from localStorage to Supabase.
