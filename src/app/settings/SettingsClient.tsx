"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MainNav } from "@/components/MainNav";

type Props = {
  userId: string;
  initialPrefs: { dietary_vegetarian: boolean; avoid_weight_language: boolean; units_oz: boolean };
};

export function SettingsClient({ userId, initialPrefs }: Props) {
  const supabase = createClient();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saved, setSaved] = useState(false);

  async function upsert() {
    await supabase.from("user_preferences").upsert({
      user_id: userId,
      dietary_vegetarian: prefs.dietary_vegetarian,
      avoid_weight_language: prefs.avoid_weight_language,
      units_oz: prefs.units_oz,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Settings</h1>
        <p className="text-sm text-attune-slate mb-6">Preferences that shape how Attune talks to you.</p>

        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl bg-white/80 border border-attune-stone px-3 py-3">
            <span className="text-sm text-attune-ink">Vegetarian dietary preference</span>
            <input type="checkbox" checked={prefs.dietary_vegetarian} onChange={(e) => setPrefs((p) => ({ ...p, dietary_vegetarian: e.target.checked }))} className="rounded" />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-white/80 border border-attune-stone px-3 py-3">
            <span className="text-sm text-attune-ink">Avoid weight-focused language</span>
            <input type="checkbox" checked={prefs.avoid_weight_language} onChange={(e) => setPrefs((p) => ({ ...p, avoid_weight_language: e.target.checked }))} className="rounded" />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-white/80 border border-attune-stone px-3 py-3">
            <span className="text-sm text-attune-ink">Use ounces (turn off for ml)</span>
            <input type="checkbox" checked={prefs.units_oz} onChange={(e) => setPrefs((p) => ({ ...p, units_oz: e.target.checked }))} className="rounded" />
          </label>
        </div>

        <button onClick={upsert} className="mt-6 w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium tap-target">
          {saved ? "Saved" : "Save preferences"}
        </button>

        <p className="mt-6 text-xs text-attune-slate">Insights use these when we can. Regenerate from the Trends page for fresh wording.</p>
      </div>
      <MainNav />
    </div>
  );
}
