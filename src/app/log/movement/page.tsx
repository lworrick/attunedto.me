"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TYPES = ["walk", "run", "strength", "yoga", "cycling", "mobility", "other"];
const INTENSITIES = ["easy", "moderate", "hard"];

export default function LogMovementPage() {
  const supabase = createClient();
  const [text, setText] = useState("");
  const [typeTag, setTypeTag] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: aiErr } = await supabase.functions.invoke("movement-estimate", { body: { text } });
    if (aiErr || !data) {
      setError("Estimate is taking a pause. You can still log the activity.");
      setLoading(false);
      return;
    }
    const d = data as { activity_type?: string; duration_min?: number; estimated_burn_min?: number; estimated_burn_max?: number; supportive_note?: string };
    const { error: insertErr } = await supabase.from("movement_logs").insert({
      raw_text: text,
      activity_type: d.activity_type ?? typeTag,
      duration_min: d.duration_min ?? null,
      intensity: intensity,
      estimated_burn_min: d.estimated_burn_min ?? null,
      estimated_burn_max: d.estimated_burn_max ?? null,
      supportive_note: d.supportive_note ?? null,
    });
    setLoading(false);
    if (insertErr) {
      setError("Log didn’t save. Try again in a moment.");
      return;
    }
    setMessage(d.supportive_note ?? "Thanks for logging. Data, not drama.");
    setText("");
    setTypeTag(null);
    setIntensity(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log movement</h1>
        <p className="text-sm text-[var(--dust)] mb-4">e.g. 25 min walk or 45 min strength training</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What movement did you do?"
          />
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Type (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Button key={t} type="button" variant={typeTag === t ? "primary" : "outline"} size="sm" className="rounded-full" onClick={() => setTypeTag(typeTag === t ? null : t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Intensity (optional)</Label>
            <div className="flex gap-2">
              {INTENSITIES.map((i) => (
                <Button key={i} type="button" variant={intensity === i ? "primary" : "outline"} size="sm" className="rounded-full" onClick={() => setIntensity(intensity === i ? null : i)}>
                  {i}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || !text.trim()} className="w-full">
            {loading ? "Estimating…" : "Log movement"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-[var(--adobe)]">{error}</p>}
        {message && <p className="mt-3 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
