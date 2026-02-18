# Edge Function Authentication Implementation

## Overview
All Edge Function calls in the Attune app use the authenticated Supabase client, which automatically handles JWT token management and authorization headers.

## Architecture

### 1. Supabase Client Singleton
**File:** `/src/app/services/supabase.ts`

```typescript
export const supabase = createClient(supabaseUrl, publicAnonKey);
```

- ✅ Created once and reused globally
- ✅ Automatically attaches Authorization header to all requests
- ✅ Uses the current user's JWT token from auth session
- ✅ Handles CORS headers automatically

### 2. Edge Function Wrapper
**File:** `/src/app/services/edgeFunctionClient.ts`

```typescript
export async function invokeEdgeFunction(functionName, options)
```

**Features:**
- ✅ Uses `supabase.functions.invoke()` (NOT manual fetch)
- ✅ Pre-checks session with `supabase.auth.getSession()`
- ✅ Redirects to login if session is null
- ✅ Automatically refreshes session on 401 errors
- ✅ Retries once after successful refresh
- ✅ Signs out and redirects if refresh fails
- ✅ Does NOT manually attach Authorization headers

**Usage:**
```typescript
const { data, error } = await invokeEdgeFunction('estimate_food', {
  body: { text: 'chicken salad', save: true }
});
```

### 3. Edge Functions (Server-Side)
**Files:** 
- `/supabase/functions/estimate_food/index.ts`
- `/supabase/functions/generate_insights/index.ts`

**Auth Flow:**
1. Check for Authorization header
2. Create Supabase client with the header
3. Call `supabase.auth.getUser()` to verify session
4. Return 401 if authentication fails
5. Proceed with request if authenticated

```typescript
// Edge function receives Authorization header automatically
const authHeader = req.headers.get("Authorization");

// Create authenticated Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_ANON_KEY"),
  {
    global: {
      headers: { Authorization: authHeader },
    },
  }
);

// Verify user
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
```

### 4. Frontend Usage
**Files:**
- `/src/app/screens/LogFoodScreen.tsx`
- `/src/app/screens/HomeScreen.tsx`
- `/src/app/screens/TrendsScreen.tsx`

**LogFoodScreen:**
```typescript
// Preview estimate (save: false)
const { data, error } = await invokeEdgeFunction('estimate_food', {
  body: {
    text: text.trim(),
    meal_tag: mealTag,
    save: false,
  },
});

// Save to database (save: true)
const { data, error } = await invokeEdgeFunction('estimate_food', {
  body: {
    text: text.trim(),
    meal_tag: mealTag,
    save: true,
  },
});
```

**HomeScreen & TrendsScreen:**
```typescript
const { data, error } = await invokeEdgeFunction('generate_insights', {
  body: { days: 14 }
});
```

## Authentication Flow

### Normal Request Flow:
1. Frontend calls `invokeEdgeFunction('estimate_food', {...})`
2. Wrapper checks session with `getSession()`
3. Session exists → Calls `supabase.functions.invoke()`
4. Supabase client attaches Authorization header with JWT
5. Edge function receives request with header
6. Edge function verifies user with `getUser()`
7. Edge function processes request and returns data
8. Frontend receives response

### Session Expiration Flow:
1. Frontend calls `invokeEdgeFunction('estimate_food', {...})`
2. Wrapper checks session → Session exists
3. Edge function returns 401 "Invalid JWT"
4. Wrapper detects 401 error
5. Wrapper calls `supabase.auth.refreshSession()`
6. New JWT obtained → Retries request automatically
7. Request succeeds with new token
8. User never notices the refresh

### Failed Refresh Flow:
1. Frontend calls `invokeEdgeFunction('estimate_food', {...})`
2. Edge function returns 401
3. Wrapper attempts session refresh
4. Refresh fails (expired refresh token)
5. Wrapper signs out user
6. Toast: "Your session has expired. Please log in again."
7. Redirect to `/login`

## Key Requirements ✅

1. **Always use supabase.functions.invoke():**
   - ✅ Implemented in `invokeEdgeFunction` wrapper
   - ✅ All screens use the wrapper
   - ✅ No manual fetch() calls to edge functions

2. **Do NOT use fetch() manually:**
   - ✅ Verified: No manual fetch calls in codebase

3. **Supabase client initialized once:**
   - ✅ Singleton instance in `/src/app/services/supabase.ts`
   - ✅ Imported and reused everywhere

4. **Session check before invocation:**
   - ✅ `getSession()` called before every edge function call
   - ✅ Redirects to login if session is null

5. **No manual Authorization headers:**
   - ✅ Supabase client handles this automatically
   - ✅ Edge functions receive header from client

6. **Retry once after refreshSession on 401:**
   - ✅ Implemented in `invokeEdgeFunction` wrapper
   - ✅ Automatic refresh and retry
   - ✅ Signs out if retry fails

## CORS Configuration
**File:** `/supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};
```

- ✅ Allows all origins (localhost, figma.com, custom domains)
- ✅ Includes authorization header
- ✅ Handles preflight OPTIONS requests

## Error Handling

### Client-Side:
- Session missing → Toast + redirect to login
- 401 error → Auto-refresh session → Retry
- Refresh fails → Sign out + redirect to login
- Other errors → Log to console + show error message

### Server-Side:
- Missing Authorization header → 401
- Invalid/expired JWT → 401
- User not found → 401
- Other errors → 500 with error message

## Testing Checklist

✅ User logs in → Edge functions work
✅ Session expires → Auto-refresh works
✅ Refresh token expires → Redirects to login
✅ No session → Redirects to login without calling API
✅ Works on any domain (CORS configured)
✅ No manual Authorization headers needed
✅ All edge function calls use wrapper
✅ Supabase client is singleton

## Benefits of This Implementation

1. **Security:** JWT tokens managed by Supabase client
2. **Reliability:** Automatic session refresh prevents errors
3. **Simplicity:** No manual header management needed
4. **Consistency:** All edge function calls use same wrapper
5. **User Experience:** Seamless session management
6. **Cross-Origin:** Works on any domain
7. **Maintainability:** Single source of truth for auth logic
