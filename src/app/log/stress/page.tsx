"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MainNav } from "@/components/MainNav";

const LEVEL_LABELS: Record<number, string> = { 1: "Very calm", 2: "Mostly calm", 3: "Moderate", 4: "High", 5: "Very high" };

export default function LogStressPage() {
  const supabase = createClient();
  const [level, setLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("stress_logs").insert({
      stress_level: level,
      notes: notes.trim() || null,
    });
    if (error) setMessage("Something went wrong. Try again.");
    else {
      setMessage("Thanks for logging. Data, not drama.");
      setLevel(3);
      setNotes("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log stress</h1>
        <p className="text-sm text-attune-slate mb-6">Where’s your stress level right now? Just a snapshot.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-xs text-attune-slate mb-2">Stress level</p>
            <input type="range" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full mb-1" />
            <p className="text-sm text-attune-ink">{LEVEL_LABELS[level]}</p>
          </div>
          <div>
            <label className="block text-xs text-attune-slate mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. busy workday, felt anxious" className="w-full rounded-xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:outline-none" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium tap-target">
            Save stress log
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-attune-slate bg-white/70 border border-attune-stone rounded-lg px-3 py-2">{message}</p>}
      </div>
      <MainNav />
    </div>
  );
}
