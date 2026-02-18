"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log stress</h1>
        <p className="text-sm text-[var(--dust)] mb-6">Where’s your stress level right now? Just a snapshot.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Stress level</Label>
            <input type="range" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full mb-1 accent-[var(--clay)]" />
            <p className="text-sm text-[var(--basalt)]">{LEVEL_LABELS[level]}</p>
          </div>
          <div>
            <Label htmlFor="notes" className="block text-xs text-[var(--dust)] mb-1">Notes (optional)</Label>
            <Input id="notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. busy workday, felt anxious" />
          </div>
          <Button type="submit" className="w-full">
            Save stress log
          </Button>
        </form>
        {message && <p className="mt-4 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
