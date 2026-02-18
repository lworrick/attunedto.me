import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// This edge function estimates food calories and macros from natural language
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
    const { text, meal_tag, is_restaurant, unsure_portions, save } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Estimating food: "${text}" (save: ${save})`);

    // Call OpenAI to estimate food
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a helpful nutritionist assistant for a body-neutral wellness app called Attune. The user described what they ate: "${text}".

Context:
${meal_tag ? `- Meal type: ${meal_tag}` : ""}
${is_restaurant ? "- This was a restaurant meal (portions may be larger)" : ""}
${unsure_portions ? "- User is unsure about portions" : ""}

Please estimate:
1. Calorie range (min-max, accounting for uncertainty)
2. Protein (g)
3. Carbs (g)
4. Fat (g)
5. Fiber (g)
6. Confidence level (low/medium/high)
7. A brief, supportive note (non-judgmental, body-neutral tone)

${unsure_portions || is_restaurant ? "Give wider ranges due to uncertainty." : ""}

Respond with valid JSON only:
{
  "calories_min": number,
  "calories_max": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "confidence": "low" | "medium" | "high",
  "supportive_note": "string"
}

Guidelines for supportive notes:
- Never use moral language (good/bad, clean/dirty, healthy/unhealthy)
- Focus on nourishment, energy, satisfaction
- Keep it brief (1-2 sentences)
- Examples: "That sounds satisfying!", "Nice balance of nutrients.", "Fueling your body well."`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a nutritionist assistant for a body-neutral wellness app. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to estimate food" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("No content in OpenAI response");
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse AI response
    let estimate;
    try {
      estimate = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If save is true, save to database
    if (save) {
      console.log("Saving food log to database");

      const { error: insertError } = await supabase
        .from("food_logs")
        .insert({
          user_id: user.id,
          text: text,
          meal_tag: meal_tag || null,
          calories_min: estimate.calories_min,
          calories_max: estimate.calories_max,
          protein_g: estimate.protein_g,
          carbs_g: estimate.carbs_g,
          fat_g: estimate.fat_g,
          fiber_g: estimate.fiber_g,
          confidence: estimate.confidence,
        });

      if (insertError) {
        console.error("Error saving food log:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save food log" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Food log saved successfully");
    }

    return new Response(
      JSON.stringify(estimate),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in estimate_food function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});