"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";

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
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log movement</h1>
        <p className="text-sm text-attune-slate mb-4">e.g. 25 min walk or 45 min strength training</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What movement did you do?"
            className="w-full rounded-2xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:outline-none"
          />
          <div>
            <p className="text-xs text-attune-slate mb-2">Type (optional)</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setTypeTag(typeTag === t ? null : t)} className={`rounded-full px-3 py-1 text-xs border tap-target ${typeTag === t ? "bg-attune-sage text-white border-attune-sage" : "border-attune-stone text-attune-slate"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-attune-slate mb-2">Intensity (optional)</p>
            <div className="flex gap-2">
              {INTENSITIES.map((i) => (
                <button key={i} type="button" onClick={() => setIntensity(intensity === i ? null : i)} className={`rounded-full px-3 py-1 text-xs border tap-target ${intensity === i ? "bg-attune-sage text-white border-attune-sage" : "border-attune-stone text-attune-slate"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || !text.trim()} className="w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium disabled:opacity-60 tap-target">
            {loading ? "Estimating…" : "Log movement"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-3 text-sm text-attune-slate bg-white/70 border border-attune-stone rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
