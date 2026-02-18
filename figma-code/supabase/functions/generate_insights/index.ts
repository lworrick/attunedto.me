import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// This edge function generates insights based on user's daily rollups
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with the user's auth token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid session" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse the request body
    const { days = 30 } = await req.json();

    // Calculate date range
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days + 1);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];

    console.log(`Fetching rollups for user ${user.id} from ${startDateStr} to ${endDateStr}`);

    // Fetch the user's daily rollups
    const { data: rollups, error: rollupsError } = await supabase
      .from("daily_rollups")
      .select("*")
      .eq("user_id", user.id)
      .gte("day", startDateStr)
      .lte("day", endDateStr)
      .order("day", { ascending: true });

    if (rollupsError) {
      console.error("Error fetching rollups:", rollupsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch rollups" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${rollups?.length || 0} rollup records`);

    // If no data, return empty insights
    if (!rollups || rollups.length === 0) {
      return new Response(
        JSON.stringify({
          patterns: ["Not enough data yet to identify patterns."],
          influences: ["Keep logging to see insights!"],
          experiment: "Try logging consistently for a week to start seeing patterns.",
          supportive_line: "Every small step counts. You're doing great!",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate insights based on rollup data
    const insights = generateInsights(rollups, days);

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate_insights function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to generate insights
function generateInsights(rollups: any[], days: number) {
  const patterns: string[] = [];
  const influences: string[] = [];
  let experiment = "";
  let supportive_line = "";

  // Calculate averages
  const avgCalories = rollups.reduce((sum, r) => sum + (r.calories_min_total + r.calories_max_total) / 2, 0) / rollups.length;
  const avgWater = rollups.reduce((sum, r) => sum + r.water_oz, 0) / rollups.length;
  const avgMovement = rollups.reduce((sum, r) => sum + r.movement_minutes, 0) / rollups.length;
  const avgSleep = rollups.reduce((sum, r) => sum + (r.sleep_quality_avg || 0), 0) / rollups.length;
  const avgStress = rollups.reduce((sum, r) => sum + (r.stress_avg || 0), 0) / rollups.length;
  const avgCravings = rollups.reduce((sum, r) => sum + r.cravings_count, 0) / rollups.length;

  // Identify patterns
  if (avgWater < 50) {
    patterns.push("Your water intake tends to be on the lower side.");
  } else if (avgWater > 80) {
    patterns.push("You're doing great with staying hydrated!");
  }

  if (avgMovement > 30) {
    patterns.push("You're consistently making time for movement, which is wonderful.");
  } else if (avgMovement < 15) {
    patterns.push("Movement has been minimal lately.");
  }

  if (avgSleep > 3.5) {
    patterns.push("Your sleep quality seems pretty solid overall.");
  } else if (avgSleep < 2.5) {
    patterns.push("Sleep quality has been lower than usual.");
  }

  if (avgStress > 3) {
    patterns.push("Stress levels have been elevated recently.");
  }

  if (avgCravings > 2) {
    patterns.push("You've been experiencing cravings more frequently.");
  }

  // Identify influences
  if (avgSleep < 3 && avgStress > 3) {
    influences.push("Lower sleep quality might be contributing to higher stress levels.");
  }

  if (avgSleep < 3 && avgCravings > 2) {
    influences.push("Less restful sleep could be influencing more frequent cravings.");
  }

  if (avgWater < 50 && avgStress > 3) {
    influences.push("Dehydration can sometimes amplify feelings of stress.");
  }

  if (avgMovement < 15 && avgStress > 3) {
    influences.push("Regular movement can help manage stress levels.");
  }

  // Default influences if none found
  if (influences.length === 0) {
    influences.push("Your habits seem fairly balanced across different areas.");
    influences.push("Continue paying attention to what makes you feel your best.");
  }

  // Generate experiment suggestion
  if (avgWater < 60) {
    experiment = "Try adding one extra glass of water in the morning and notice how you feel.";
  } else if (avgMovement < 20) {
    experiment = "Try a 10-minute walk after one meal and see how it affects your energy.";
  } else if (avgSleep < 3) {
    experiment = "Consider winding down 15 minutes earlier before bed and track your sleep quality.";
  } else {
    experiment = "Keep doing what you're doing! Notice which days feel best and what contributes to that.";
  }

  // Generate supportive line
  const supportiveLines = [
    "Remember, wellness is about progress, not perfection.",
    "You're showing up for yourself, and that's what matters most.",
    "Every day is a new opportunity to learn about what works for you.",
    "Small, consistent changes add up to big shifts over time.",
    "Your body is always communicating with you. You're learning to listen.",
  ];
  supportive_line = supportiveLines[Math.floor(Math.random() * supportiveLines.length)];

  return {
    patterns,
    influences,
    experiment,
    supportive_line,
  };
}
