import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const MOVEMENT_SYSTEM = `You are a supportive, body-neutral wellness assistant. Parse a short movement description into structured data.
Rules: Be gentle and neutral. Estimate duration in minutes and calorie burn as a RANGE (estimated_burn_min, estimated_burn_max). Never shame or pressure.
Return ONLY valid JSON with: activity_type (string, e.g. "walk", "strength"), duration_min (number), estimated_burn_min (number), estimated_burn_max (number), supportive_note (1 short supportive sentence).`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { text } = (await req.json()) as { text?: string };
    if (!text?.trim()) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Server config error" }), { status: 500 });

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: MOVEMENT_SYSTEM },
          { role: "user", content: text },
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
