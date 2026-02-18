"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function LogFoodPage() {
  const supabase = createClient();
  const [text, setText] = useState("");
  const [mealTag, setMealTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data: aiData, error: aiErr } = await supabase.functions.invoke("food-estimate", {
      body: { text, meal_tag: mealTag ?? undefined },
    });

    if (aiErr || !aiData) {
      setError("Estimate is taking a pause. You can still log — save as-is below.");
      setLoading(false);
      return;
    }

    const d = aiData as {
      calories_min?: number;
      calories_max?: number;
      protein_g?: number;
      carbs_g?: number;
      fat_g?: number;
      fiber_g?: number;
      confidence?: string;
      supportive_note?: string | null;
    };

    const { error: insertErr } = await supabase.from("food_logs").insert({
      text,
      meal_tag: mealTag,
      calories_min: d.calories_min ?? null,
      calories_max: d.calories_max ?? null,
      protein_g: d.protein_g ?? null,
      carbs_g: d.carbs_g ?? null,
      fat_g: d.fat_g ?? null,
      fiber_g: d.fiber_g ?? null,
      confidence: d.confidence ?? null,
      supportive_note: d.supportive_note ?? null,
    });

    setLoading(false);
    if (insertErr) {
      setError("Log didn’t save. You’re still doing your best.");
      return;
    }
    setMessage(d.supportive_note ?? "Thanks for logging. Data, not drama.");
    setText("");
    setMealTag(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log food</h1>
        <p className="text-sm text-attune-slate mb-4">Short descriptions are fine. Portions can be approximate.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:outline-none"
            placeholder="e.g. veggie burrito with black beans, rice, guac"
          />
          <div>
            <p className="text-xs text-attune-slate mb-2">Meal (optional)</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMealTag(mealTag === tag ? null : tag)}
                  className={`rounded-full px-3 py-1 text-xs border tap-target ${mealTag === tag ? "bg-attune-sage text-white border-attune-sage" : "border-attune-stone text-attune-slate"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || !text.trim()} className="w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium disabled:opacity-60 tap-target">
            {loading ? "Estimating…" : "Log food"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-3 text-sm text-attune-slate bg-white/70 border border-attune-stone rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
