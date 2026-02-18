"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS = [8, 12, 16];

export default function LogWaterPage() {
  const supabase = createClient();
  const [customOz, setCustomOz] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  async function add(oz: number) {
    const { error } = await supabase.from("water_logs").insert({ ounces: oz });
    if (error) setMessage("Something went wrong. Try again in a moment.");
    else setMessage("Noted. Thanks for logging.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log water</h1>
        <p className="text-sm text-[var(--dust)] mb-6">Quick taps are welcome.</p>

        <div className="flex gap-2 mb-6">
          {PRESETS.map((oz) => (
            <Button key={oz} variant="outline" className="flex-1" onClick={() => add(oz)}>
              +{oz} oz
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-[var(--dust)]">Custom amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              step={1}
              value={customOz}
              onChange={(e) => setCustomOz(e.target.value)}
              placeholder="e.g. 10"
              className="flex-1"
            />
            <Button
              onClick={() => { const n = parseFloat(customOz); if (n > 0) add(n); }}
              disabled={!customOz || parseFloat(customOz) <= 0}
            >
              Add
            </Button>
          </div>
        </div>
        {message && <p className="mt-4 text-sm text-[var(--dust)] bg-[var(--bone)] border border-[var(--dust)] rounded-lg px-3 py-2">{message}</p>}
      </div>
    </div>
  );
}
