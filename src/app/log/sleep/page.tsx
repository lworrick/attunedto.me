"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log sleep</h1>
        <p className="text-sm text-[var(--dust)] mb-6">How did sleep feel? No judgment.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Sleep quality</Label>
            <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mb-1 accent-[var(--clay)]" />
            <p className="text-sm text-[var(--basalt)]">{QUALITY_LABELS[quality]}</p>
          </div>
          <div>
            <Label htmlFor="hours" className="block text-xs text-[var(--dust)] mb-1">Hours slept (optional)</Label>
            <Input id="hours" type="number" min={0} max={24} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 7" />
          </div>
          <div>
            <Label htmlFor="notes" className="block text-xs text-[var(--dust)] mb-1">Notes (optional)</Label>
            <Input id="notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. woke up often, felt rested" />
          </div>
          <Button type="submit" className="w-full">
            Save sleep log
          </Button>
        </form>
        {message && <p className="mt-4 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
