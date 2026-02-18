import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role key (for admin operations)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Supabase client with anon key (for auth operations)
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3253d8ee/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth API
// Sign up a new user
app.post("/make-server-3253d8ee/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('Creating user with email:', email);

    // First, try to create the user with admin API
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: {},
    });

    if (adminError) {
      console.log('Admin create user error:', adminError);
      
      // If admin API fails, try fallback approach: create user via client, then update
      console.log('Trying fallback: direct database update approach');
      
      // Use anon client to sign up
      const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.log('Signup error:', signUpError);
        
        if (signUpError.message.includes('already registered')) {
          return c.json({ error: 'This email is already registered. Please sign in instead.' }, 400);
        }
        
        return c.json({ 
          error: `Failed to create user: ${signUpError.message}`,
        }, 400);
      }

      // Now update the user to confirm their email using service role
      if (signUpData.user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          signUpData.user.id,
          { email_confirm: true }
        );

        if (updateError) {
          console.log('Error confirming email:', updateError);
          // User is created but not confirmed - they can still try to sign in
        }

        console.log('User created via fallback method:', signUpData.user.id);
        return c.json({ 
          user: signUpData.user,
          message: 'Account created successfully. You can now sign in.',
        }, 201);
      }
    }

    console.log('User created successfully via admin API:', adminData.user.id);

    // Return success - frontend will handle sign in
    return c.json({ 
      user: adminData.user,
      message: 'Account created successfully. You can now sign in.',
    }, 201);
  } catch (error) {
    console.log('Unexpected error in POST /auth/signup:', error);
    console.log('Error stack:', error.stack);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Water Logs API
// Create a water log entry
app.post("/make-server-3253d8ee/water-logs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    // Use anon client to validate the JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while creating water log:', authError);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const body = await c.req.json();
    const { ounces } = body;

    if (!ounces || typeof ounces !== 'number') {
      return c.json({ error: 'Invalid input - ounces is required and must be a number' }, 400);
    }

    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        ounces,
        // created_at will be set automatically by database default
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating water log:', error);
      return c.json({ error: `Failed to create water log: ${error.message}` }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.log('Unexpected error in POST /water-logs:', error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Get water logs for current user (with optional date filtering)
app.get("/make-server-3253d8ee/water-logs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    // Use anon client to validate the JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while fetching water logs:', authError);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const date = c.req.query('date'); // Optional: YYYY-MM-DD format

    let query = supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // If date is provided, filter for that specific day
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.log('Error fetching water logs:', error);
      return c.json({ error: `Failed to fetch water logs: ${error.message}` }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log('Unexpected error in GET /water-logs:', error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Delete a water log entry
app.delete("/make-server-3253d8ee/water-logs/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    // Use anon client to validate the JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while deleting water log:', authError);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const id = c.req.param('id');

    // First verify the log belongs to the user
    const { data: existingLog } = await supabase
      .from('water_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingLog || existingLog.user_id !== user.id) {
      return c.json({ error: 'Water log not found or unauthorized' }, 404);
    }

    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Error deleting water log:', error);
      return c.json({ error: `Failed to delete water log: ${error.message}` }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Unexpected error in DELETE /water-logs/:id:', error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);