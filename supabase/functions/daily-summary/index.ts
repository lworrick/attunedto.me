import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const DAILY_SYSTEM = `You are a supportive, body-neutral wellness assistant. Generate a short "Daily Snapshot" for the user based on their logged data.
Rules: Use 2-5 supportive sentences. Include 1 gentle suggestion (e.g. "If you'd like to try..."). End with 1 supportive closing line. Never use moral language, shame, or weight-loss framing unless the user asked for it. Use "It looks like...", "You might be noticing...". Always validate effort.`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = (await req.json()) as {
      nutrition?: { calories_min?: number; calories_max?: number; protein?: number; fiber?: number };
      water?: number;
      cravings?: { count: number; avg_intensity?: number }[];
      movement?: { minutes?: number; burn_min?: number; burn_max?: number };
      sleep_quality_avg?: number;
      stress_level_avg?: number;
    };

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Server config error" }), { status: 500 });

    const userContent = `Today's data (use for context only; be brief and supportive): ${JSON.stringify(body)}`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: DAILY_SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
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
    const result = {
      summary_text: parsed.summary_text ?? parsed.summary ?? "",
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      suggestion: parsed.suggestion ?? "",
      supportive_line: parsed.supportive_line ?? parsed.supportiveLine ?? "",
    };
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
