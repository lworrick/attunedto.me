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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setSaving(false);
    setError(null);
    setMessage(null);

    // Safety: never leave the button stuck for more than 25 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setSaving(false);
    }, 25000);

    const ESTIMATE_TIMEOUT_MS = 12000; // 12 seconds then give up and save without estimate
    let aiData: unknown = null;
    let aiErr: Error | null = null;

    let estimateFailureReason: string | null = null;

    try {
      const invokePromise = supabase.functions.invoke("food-estimate", {
        body: { text, meal_tag: mealTag ?? undefined },
      });
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), ESTIMATE_TIMEOUT_MS)
      );
      const result = await Promise.race([invokePromise, timeoutPromise]);
      aiData = result.data;
      aiErr = result.error ?? null;
      // Capture why estimate failed (for debugging / user message)
      if (result.error) {
        estimateFailureReason = (result.error as { message?: string }).message ?? String(result.error);
      } else if (result.data && typeof result.data === "object" && "error" in result.data) {
        const errBody = (result.data as { error?: string; details?: string }).error;
        estimateFailureReason = errBody ?? "Estimate returned an error";
      }
    } catch (err) {
      aiErr = err instanceof Error ? err : new Error(String(err));
      estimateFailureReason = aiErr.message;
    }

    let calories_min: number | null = null;
    let calories_max: number | null = null;
    let protein_g: number | null = null;
    let carbs_g: number | null = null;
    let fat_g: number | null = null;
    let fiber_g: number | null = null;
    let confidence: string | null = null;
    let supportive_note: string | null = null;

    // Only use as nutrition if we got real data (no "error" key from the function)
    const hasErrorKey = aiData && typeof aiData === "object" && "error" in aiData;
    if (!aiErr && aiData && typeof aiData === "object" && !hasErrorKey) {
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
      calories_min = d.calories_min ?? null;
      calories_max = d.calories_max ?? null;
      protein_g = d.protein_g ?? null;
      carbs_g = d.carbs_g ?? null;
      fat_g = d.fat_g ?? null;
      fiber_g = d.fiber_g ?? null;
      confidence = d.confidence ?? null;
      supportive_note = d.supportive_note ?? null;
    }

    // Stop "Estimating..." so we never get stuck; show "Saving..." during insert
    setLoading(false);
    setSaving(true);

    try {
      const { error: insertErr } = await supabase.from("food_logs").insert({
      text,
      meal_tag: mealTag,
      calories_min,
      calories_max,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      confidence,
      supportive_note,
    });

    setSaving(false);
    if (insertErr) {
      setError("Log didn’t save. You’re still doing your best.");
      return;
    }
    setMessage(
      supportive_note ??
        (aiErr || !aiData || hasErrorKey
          ? estimateFailureReason
            ? `Logged without estimate. (${estimateFailureReason})`
            : "Logged without estimate. You're still doing your best."
          : "Thanks for logging. Data, not drama.")
    );
    setText("");
    setMealTag(null);
    } catch {
      setSaving(false);
      setError("Something went wrong. Try again in a moment.");
    } finally {
      clearTimeout(safetyTimer);
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
          <Button type="submit" disabled={(loading || saving) || !text.trim()} className="w-full">
            {loading ? "Estimating…" : saving ? "Saving…" : "Log food"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-[var(--adobe)]">{error}</p>}
        {message && <p className="mt-3 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
