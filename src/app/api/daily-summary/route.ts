import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server missing Supabase config" },
      { status: 500 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = `${SUPABASE_URL}/functions/v1/daily-summary`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return NextResponse.json(
      { error: "Summary request timed out or failed. Try again in a moment." },
      { status: 504 }
    );
  }
  clearTimeout(timeoutId);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(data || { error: "Function error" }, {
      status: res.status,
    });
  }
  return NextResponse.json(data);
}
