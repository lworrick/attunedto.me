import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const CRAVING_SYSTEM = `You are a supportive, body-neutral wellness assistant. User shared a craving. Offer alternatives without judgment.
Rules: Never use moral language. Never shame. Include 2-4 supportive alternative options, 1 "honor the craving" option (it's okay to have what they want), and 1 short supportive suggestion.
Return ONLY valid JSON: alternatives (array of strings, 2-4 items), honor_option (string, e.g. "It's okay to have exactly what you're craving"), suggestion (string, 1 supportive sentence).`;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { craving_text, intensity, category } = (await req.json()) as {
      craving_text?: string;
      intensity?: number;
      category?: string;
    };
    if (!craving_text?.trim()) return new Response(JSON.stringify({ error: "Missing craving_text" }), { status: 400 });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Server config error" }), { status: 500 });

    let userContent = `Craving: ${craving_text}`;
    if (intensity != null) userContent += ` (intensity 1-5: ${intensity})`;
    if (category) userContent += ` (category: ${category})`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CRAVING_SYSTEM },
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
    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
