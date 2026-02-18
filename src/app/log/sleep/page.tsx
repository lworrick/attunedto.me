"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";

const QUALITY_LABELS: Record<number, string> = { 1: "Very poor", 2: "Poor", 3: "Okay", 4: "Good", 5: "Excellent" };

export default function LogSleepPage() {
  const supabase = createClient();
  const [quality, setQuality] = useState(3);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hoursNum = hours ? parseFloat(hours) : null;
    const { error } = await supabase.from("sleep_logs").insert({
      sleep_quality: quality,
      hours_slept: hoursNum,
      notes: notes.trim() || null,
    });
    if (error) setMessage("Something went wrong. Try again.");
    else {
      setMessage("Thanks for logging. Data, not drama.");
      setQuality(3);
      setHours("");
      setNotes("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log sleep</h1>
        <p className="text-sm text-attune-slate mb-6">How did sleep feel? No judgment.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-xs text-attune-slate mb-2">Sleep quality</p>
            <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mb-1" />
            <p className="text-sm text-attune-ink">{QUALITY_LABELS[quality]}</p>
          </div>
          <div>
            <label className="block text-xs text-attune-slate mb-1">Hours slept (optional)</label>
            <input type="number" min={0} max={24} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 7" className="w-full rounded-xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink focus:border-attune-sage focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-attune-slate mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. woke up often, felt rested" className="w-full rounded-xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:outline-none" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium tap-target">
            Save sleep log
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-attune-slate bg-white/70 border border-attune-stone rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
