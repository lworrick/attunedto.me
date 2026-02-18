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

      // 2. Get estimate in the background and update the row when it's ready
      const rowId = inserted?.id;
      if (rowId) {
        supabase.functions
          .invoke("food-estimate", {
            body: { text: textToSave, meal_tag: mealTagToSave ?? undefined },
          })
          .then(({ data, error: aiErr }) => {
            if (aiErr || !data || (typeof data === "object" && "error" in data))
              return;
            const d = data as {
              calories_min?: number;
              calories_max?: number;
              protein_g?: number;
              carbs_g?: number;
              fat_g?: number;
              fiber_g?: number;
              confidence?: string;
              supportive_note?: string | null;
            };
            supabase
              .from("food_logs")
              .update({
                calories_min: d.calories_min ?? null,
                calories_max: d.calories_max ?? null,
                protein_g: d.protein_g ?? null,
                carbs_g: d.carbs_g ?? null,
                fat_g: d.fat_g ?? null,
                fiber_g: d.fiber_g ?? null,
                confidence: d.confidence ?? null,
                supportive_note: d.supportive_note ?? null,
              })
              .eq("id", rowId)
              .then(() => {});
          });
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
        {message && <p className="mt-3 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
