import "jsr:@supabase/functions-js/edge_runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const FOOD_SYSTEM = `You are a supportive, body-neutral wellness assistant. Estimate nutrition from a short food description.
Rules: Never use moral language (good, bad, clean, junk, cheat). Be gentle and neutral. Always give a rough RANGE for calories (calories_min, calories_max).
Return ONLY valid JSON with exactly these keys: calories_min (number), calories_max (number), protein_g (number), carbs_g (number), fat_g (number), fiber_g (number), confidence ("low"|"medium"|"high"), optional_followup_question (string or null), supportive_note (1-2 short supportive sentences, no judgment).`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { text, meal_tag } = (await req.json()) as { text?: string; meal_tag?: string };
    if (!text?.trim()) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Server config error" }), { status: 500 });

    const userContent = meal_tag ? `Meal: ${meal_tag}. Description: ${text}` : text;
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: FOOD_SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "AI request failed", details: err }), { status: 502 });
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 502 });
    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
