"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MainNav } from "@/components/MainNav";

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
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log water</h1>
        <p className="text-sm text-attune-slate mb-6">Quick taps are welcome.</p>

        <div className="flex gap-2 mb-6">
          {PRESETS.map((oz) => (
            <button key={oz} onClick={() => add(oz)} className="flex-1 rounded-xl bg-white/80 border border-attune-stone py-3 text-sm tap-target">
              +{oz} oz
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-attune-slate">Custom amount</p>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={customOz}
              onChange={(e) => setCustomOz(e.target.value)}
              placeholder="e.g. 10"
              className="flex-1 rounded-xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink focus:border-attune-sage focus:outline-none"
            />
            <button
              onClick={() => { const n = parseFloat(customOz); if (n > 0) add(n); }}
              disabled={!customOz || parseFloat(customOz) <= 0}
              className="rounded-xl bg-attune-sage text-white px-4 py-2 text-sm font-medium disabled:opacity-60 tap-target"
            >
              Add
            </button>
          </div>
        </div>
        {message && <p className="mt-4 text-sm text-attune-slate bg-white/70 border border-attune-stone rounded-lg px-3 py-2">{message}</p>}
      </div>
      <MainNav />
    </div>
  );
}
