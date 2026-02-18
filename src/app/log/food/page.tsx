"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function LogFoodPage() {
  const supabase = createClient();
  const [text, setText] = useState("");
  const [mealTag, setMealTag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const textToSave = text;
    const mealTagToSave = mealTag;

    try {
      // 1. Save immediately so the user never waits for the estimate
      const { data: inserted, error: insertErr } = await supabase
        .from("food_logs")
        .insert({
          text: textToSave,
          meal_tag: mealTagToSave,
          calories_min: null,
          calories_max: null,
          protein_g: null,
          carbs_g: null,
          fat_g: null,
          fiber_g: null,
          confidence: null,
          supportive_note: null,
        })
        .select("id")
        .single();

      setSaving(false);
      if (insertErr) {
        setError("Log didn't save. You're still doing your best.");
        return;
      }

      setMessage("Thanks for logging. Estimating nutrition in the background…");
      setText("");
      setMealTag(null);

      // 2. Get estimate in the background. Call Edge Function directly with anon key (works on Vercel when env is set at build).
      const rowId = inserted?.id;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (rowId && supabaseUrl && anonKey) {
        fetch(`${supabaseUrl}/functions/v1/food-estimate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ text: textToSave, meal_tag: mealTagToSave ?? undefined }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
          .then(({ ok, data }) => {
            if (!ok || !data || (typeof data === "object" && "error" in data)) {
              if (!ok) console.error("[food-estimate] function error:", data);
              else if (data && typeof data === "object" && "error" in data) console.warn("[food-estimate] no data or error in response:", data);
              return;
            }
            const d = data as Record<string, unknown>;
            const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : typeof v === "string" ? Number(v) : null);
            // Accept snake_case (prompt) or camelCase (model sometimes)
            const get = (snake: string, camel: string) => d[snake] ?? d[camel];
            const caloriesMin = num(get("calories_min", "caloriesMin"));
            const caloriesMax = num(get("calories_max", "caloriesMax"));
            const proteinG = num(get("protein_g", "proteinG"));
            const carbsG = num(get("carbs_g", "carbsG"));
            const fatG = num(get("fat_g", "fatG"));
            const fiberG = num(get("fiber_g", "fiberG"));
            const confVal = get("confidence", "confidence");
            const noteVal = get("supportive_note", "supportiveNote");
            const confidence = typeof confVal === "string" ? confVal : null;
            const supportiveNote = typeof noteVal === "string" ? noteVal : null;
            supabase
              .from("food_logs")
              .update({
                calories_min: caloriesMin ?? null,
                calories_max: caloriesMax ?? null,
                protein_g: proteinG ?? null,
                carbs_g: carbsG ?? null,
                fat_g: fatG ?? null,
                fiber_g: fiberG ?? null,
                confidence,
                supportive_note: supportiveNote,
              })
              .eq("id", rowId)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error("[food-estimate] DB update failed:", updateErr.message);
                else console.info("[food-estimate] row updated:", rowId);
              });
          })
          .catch((err) => console.error("[food-estimate] invoke failed:", err));
      } else if (rowId && (!supabaseUrl || !anonKey)) {
        console.warn("[food-estimate] missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
      }
    } catch {
      setSaving(false);
      setError("Something went wrong. Try again in a moment.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log food</h1>
        <p className="text-sm text-[var(--dust)] mb-4">Short descriptions are fine. Portions can be approximate.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--dust)] bg-[var(--bone)] px-3 py-2 text-sm text-[var(--basalt)] placeholder:text-[var(--dust)] focus:border-[var(--clay)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
            placeholder="e.g. veggie burrito with black beans, rice, guac"
          />
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Meal (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TAGS.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={mealTag === tag ? "primary" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setMealTag(mealTag === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving || !text.trim()} className="w-full">
            {saving ? "Saving…" : "Log food"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-[var(--adobe)]">{error}</p>}
        {message && (
          <p className="mt-3 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">
            {message}
            <span className="block mt-1 text-xs opacity-90">Numbers usually appear on Today within a minute; tap Refresh there if not.</span>
          </p>
        )}
      </div>
    </div>
  );
}
