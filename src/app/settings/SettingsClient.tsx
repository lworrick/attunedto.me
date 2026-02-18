"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Settings</h1>
        <p className="text-sm text-[var(--dust)] mb-6">Preferences that shape how Attune talks to you.</p>

        <div className="space-y-4">
          <Card className="flex items-center justify-between px-4 py-3">
            <Label className="text-sm text-[var(--basalt)] cursor-pointer flex-1">Vegetarian dietary preference</Label>
            <input type="checkbox" checked={prefs.dietary_vegetarian} onChange={(e) => setPrefs((p) => ({ ...p, dietary_vegetarian: e.target.checked }))} className="rounded border-[var(--dust)]" />
          </Card>
          <Card className="flex items-center justify-between px-4 py-3">
            <Label className="text-sm text-[var(--basalt)] cursor-pointer flex-1">Avoid weight-focused language</Label>
            <input type="checkbox" checked={prefs.avoid_weight_language} onChange={(e) => setPrefs((p) => ({ ...p, avoid_weight_language: e.target.checked }))} className="rounded border-[var(--dust)]" />
          </Card>
          <Card className="flex items-center justify-between px-4 py-3">
            <Label className="text-sm text-[var(--basalt)] cursor-pointer flex-1">Use ounces (turn off for ml)</Label>
            <input type="checkbox" checked={prefs.units_oz} onChange={(e) => setPrefs((p) => ({ ...p, units_oz: e.target.checked }))} className="rounded border-[var(--dust)]" />
          </Card>
        </div>

        <Button onClick={upsert} className="mt-6 w-full">
          {saved ? "Saved" : "Save preferences"}
        </Button>

        <p className="mt-6 text-xs text-[var(--dust)]">Insights use these when we can. Regenerate from the Trends page for fresh wording.</p>
      </div>
    </div>
  );
}
