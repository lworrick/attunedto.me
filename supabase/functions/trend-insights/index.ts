import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const TREND_SYSTEM = `You are a supportive, body-neutral wellness assistant. Generate trend insights from the user's daily rollup data over time.
Rules: Be supportive and non-judgmental. Return JSON with: patterns (array of strings - "Patterns I'm noticing"), influences (array of strings - "What might be influencing this", include sleep/stress), experiment (string - "One small experiment to try"), supportive_line (string - closing). Never shame or use moral language.`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { daily_rollups } = (await req.json()) as { daily_rollups?: unknown[] };
    if (!Array.isArray(daily_rollups) || daily_rollups.length === 0) {
      return new Response(JSON.stringify({
        patterns: [],
        influences: [],
        experiment: "Keep logging when you can — patterns become clearer over time.",
        supportive_line: "You're building a helpful picture of what supports you.",
      }), { headers: { "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Server config error" }), { status: 500 });

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: TREND_SYSTEM },
          { role: "user", content: `Daily rollup data (summarize patterns supportively): ${JSON.stringify(daily_rollups)}` },
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
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      influences: Array.isArray(parsed.influences) ? parsed.influences : [],
      experiment: parsed.experiment ?? "",
      supportive_line: parsed.supportive_line ?? parsed.supportiveLine ?? "",
    };
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
