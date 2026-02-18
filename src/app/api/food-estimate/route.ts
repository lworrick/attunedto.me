import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server missing Supabase config" },
      { status: 500 }
    );
  }
  let body: { text?: string; meal_tag?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const url = `${SUPABASE_URL}/functions/v1/food-estimate`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      text: body.text.trim(),
      meal_tag: body.meal_tag ?? undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(data || { error: "Function error" }, {
      status: res.status,
    });
  }
  return NextResponse.json(data);
}
