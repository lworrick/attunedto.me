"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MainNav } from "@/components/MainNav";

type Props = {
  nutrition: { min: number; max: number; protein: number; fiber: number } | null;
  waterTotal: number;
  movement: { minutes: number; burnMin: number; burnMax: number } | null;
  cravingsCount: number;
  cravingsAvgIntensity: number;
  sleepAvg: number | null;
  stressAvg: number | null;
};

export function TodayClient(props: Props) {
  const [snapshot, setSnapshot] = useState<{ summary_text?: string; suggestion?: string; supportive_line?: string } | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const body = {
      nutrition: props.nutrition ? { calories_min: props.nutrition.min, calories_max: props.nutrition.max, protein: props.nutrition.protein, fiber: props.nutrition.fiber } : null,
      water: props.waterTotal || undefined,
      cravings: props.cravingsCount ? { count: props.cravingsCount, avg_intensity: props.cravingsAvgIntensity } : null,
      movement: props.movement ? { minutes: props.movement.minutes, burn_min: props.movement.burnMin, burn_max: props.movement.burnMax } : null,
      sleep_quality_avg: props.sleepAvg ?? undefined,
      stress_level_avg: props.stressAvg ?? undefined,
    };
    supabase.functions.invoke("daily-summary", { body }).then(({ data, error }) => {
      if (error) setSnapshotError("Snapshot is taking a short break.");
      else if (data) setSnapshot(data as { summary_text?: string; suggestion?: string; supportive_line?: string });
    });
  }, [props.nutrition, props.waterTotal, props.movement, props.cravingsCount, props.cravingsAvgIntensity, props.sleepAvg, props.stressAvg, supabase]);

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-5 max-w-md mx-auto">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-attune-ink">Today</h1>
          <p className="text-sm text-attune-slate">Thanks for logging. Data, not drama.</p>
        </header>

        <section className="space-y-2 mb-6">
          <p className="text-xs text-attune-slate uppercase tracking-wide">Quick log</p>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/log/food" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log food</Link>
            <Link href="/log/water" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log water</Link>
            <Link href="/log/craving" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log craving</Link>
            <Link href="/log/movement" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log movement</Link>
            <Link href="/log/sleep" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log sleep</Link>
            <Link href="/log/stress" className="rounded-xl bg-white/80 border border-attune-stone py-3 text-center text-sm tap-target">Log stress</Link>
          </div>
        </section>

        <section className="space-y-3 mb-6">
          <SummaryCard title="Estimated energy" value={props.nutrition ? `${props.nutrition.min}–${props.nutrition.max} kcal (approx.)` : "Not logged yet"} subtitle="Rough range only." />
          <SummaryCard title="Protein & fiber" value={props.nutrition ? `${Math.round(props.nutrition.protein)} g protein · ${Math.round(props.nutrition.fiber)} g fiber` : "Not logged yet"} />
          <SummaryCard title="Water" value={props.waterTotal ? `${props.waterTotal} oz` : "Not logged yet"} />
          <SummaryCard title="Movement" value={props.movement ? `${props.movement.minutes} min · ~${props.movement.burnMin}–${props.movement.burnMax} kcal` : "Not logged yet"} />
          <SummaryCard title="Cravings" value={props.cravingsCount ? `${props.cravingsCount} logged` : "Not logged yet"} />
          <SummaryCard title="Sleep & stress" value={props.sleepAvg != null || props.stressAvg != null ? `Sleep ~${(props.sleepAvg ?? "–")}/5 · Stress ~${(props.stressAvg ?? "–")}/5` : "Not logged yet"} />
        </section>

        <section>
          <h2 className="text-sm font-medium text-attune-ink mb-2">Daily snapshot</h2>
          <div className="rounded-2xl bg-white/70 border border-attune-stone p-4 text-sm space-y-2">
            {snapshotError && <p className="text-attune-slate">{snapshotError}</p>}
            {snapshot?.summary_text && <p className="whitespace-pre-line text-attune-ink">{snapshot.summary_text}</p>}
            {snapshot?.suggestion && <p className="text-attune-slate">If you’d like to try: {snapshot.suggestion}</p>}
            {snapshot?.supportive_line && <p className="text-attune-slate">{snapshot.supportive_line}</p>}
            {!snapshot?.summary_text && !snapshotError && <p className="text-attune-slate">Log a few things today and we’ll put together a gentle snapshot.</p>}
          </div>
        </section>
      </div>
      <MainNav />
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-attune-stone p-3">
      <p className="text-xs text-attune-slate mb-1">{title}</p>
      <p className="text-sm font-medium text-attune-ink">{value}</p>
      {subtitle && <p className="text-xs text-attune-mist mt-1">{subtitle}</p>}
    </div>
  );
}
