import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MOVEMENT_SYSTEM = `You are a supportive, body-neutral wellness assistant. Parse a short movement description into structured data.
Rules: Be gentle and neutral. Estimate duration in minutes and calorie burn as a RANGE (estimated_burn_min, estimated_burn_max). Never shame or pressure.
Return ONLY valid JSON with: activity_type (string, e.g. "walk", "strength"), duration_min (number), estimated_burn_min (number), estimated_burn_max (number), supportive_note (1 short supportive sentence).`;

function jsonResponse(body: string, status: number) {
  return new Response(body, { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(JSON.stringify({ error: "Method not allowed" }), 405);

  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text?.trim()) return jsonResponse(JSON.stringify({ error: "Missing text" }), 400);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return jsonResponse(JSON.stringify({ error: "Server config error" }), 500);

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
      return jsonResponse(JSON.stringify({ error: "AI request failed", details: err }), 502);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return jsonResponse(JSON.stringify({ error: "Invalid AI response" }), 502);
    const parsed = JSON.parse(content);
    return jsonResponse(JSON.stringify(parsed), 200);
  } catch (e) {
    return jsonResponse(JSON.stringify({ error: String(e) }), 500);
  }
});
