"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import {
  IconFood,
  IconWater,
  IconCraving,
  IconMovement,
  IconSleep,
  IconStress,
  IconSparkle,
} from "@/components/icons";

type Props = {
  nutrition: { min: number; max: number; protein: number; fiber: number } | null;
  waterTotal: number;
  movement: { minutes: number; burnMin: number; burnMax: number } | null;
  cravingsCount: number;
  cravingsAvgIntensity: number;
  sleepAvg: number | null;
  stressAvg: number | null;
};

const QUICK_LOGS = [
  { href: "/log/food", label: "Log Food", Icon: IconFood, color: "text-attune-iconFood" },
  { href: "/log/water", label: "Log Water", Icon: IconWater, color: "text-attune-iconWater" },
  { href: "/log/craving", label: "Log Craving", Icon: IconCraving, color: "text-attune-iconCraving" },
  { href: "/log/movement", label: "Log Movement", Icon: IconMovement, color: "text-attune-iconMovement" },
  { href: "/log/sleep", label: "Log Sleep", Icon: IconSleep, color: "text-attune-iconSleep" },
  { href: "/log/stress", label: "Log Stress", Icon: IconStress, color: "text-attune-iconStress" },
] as const;

function formatTodayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TodayClient(props: Props) {
  const [snapshot, setSnapshot] = useState<{ summary_text?: string; suggestion?: string; supportive_line?: string } | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
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

  function handleGenerateInsights() {
    setInsightsLoading(true);
    // Re-trigger snapshot fetch; in a full implementation you might call trend-insights for 14 days
    supabase.functions.invoke("daily-summary", {
      body: {
        nutrition: props.nutrition ? { calories_min: props.nutrition.min, calories_max: props.nutrition.max, protein: props.nutrition.protein, fiber: props.nutrition.fiber } : null,
        water: props.waterTotal || undefined,
        cravings: props.cravingsCount ? { count: props.cravingsCount, avg_intensity: props.cravingsAvgIntensity } : null,
        movement: props.movement ? { minutes: props.movement.minutes, burn_min: props.movement.burnMin, burn_max: props.movement.burnMax } : null,
        sleep_quality_avg: props.sleepAvg ?? undefined,
        stress_level_avg: props.stressAvg ?? undefined,
      },
    }).then(({ data, error }) => {
      setInsightsLoading(false);
      if (!error && data) setSnapshot(data as { summary_text?: string; suggestion?: string; supportive_line?: string });
    });
  }

  const hasSnapshot = snapshot?.summary_text || snapshot?.suggestion || snapshot?.supportive_line;

  return (
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 max-w-md mx-auto w-full">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-attune-ink">Today</h1>
          <p className="text-sm text-attune-slate mt-0.5">{formatTodayDate()}</p>
        </header>

        <section className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LOGS.map(({ href, label, Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl bg-white/90 border border-attune-stone shadow-sm flex flex-col items-center justify-center py-5 gap-2 tap-target hover:bg-attune-stone/20 transition"
              >
                <Icon className={`w-8 h-8 shrink-0 ${color}`} />
                <span className="text-sm font-medium text-attune-ink">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="rounded-2xl bg-white/90 border border-attune-stone shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-attune-ink">Want personalized insights?</h2>
              <p className="text-sm text-attune-slate mt-0.5">Generate AI insights from your last 14 days of tracking.</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              className="shrink-0 rounded-xl bg-attune-stone/80 hover:bg-attune-stone text-attune-ink font-medium py-2 px-4 flex items-center gap-2 tap-target disabled:opacity-60"
            >
              <IconSparkle className="w-4 h-4" />
              {insightsLoading ? "Generating…" : "Generate"}
            </button>
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-white/90 border border-attune-stone shadow-sm p-4">
            {hasSnapshot ? (
              <div className="text-sm space-y-2">
                <h2 className="font-semibold text-attune-ink">Daily snapshot</h2>
                {snapshot?.summary_text && <p className="whitespace-pre-line text-attune-ink">{snapshot.summary_text}</p>}
                {snapshot?.suggestion && <p className="text-attune-slate">If you’d like to try: {snapshot.suggestion}</p>}
                {snapshot?.supportive_line && <p className="text-attune-slate">{snapshot.supportive_line}</p>}
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-attune-ink">Welcome to a fresh day!</h2>
                <p className="text-attune-slate mt-2 text-sm">
                  Start by logging your first activity using the buttons above. Your daily summary will appear here as you track your wellness journey.
                </p>
                {snapshotError && <p className="text-attune-slate text-sm mt-2">{snapshotError}</p>}
              </>
            )}
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-medium text-attune-slate uppercase tracking-wide">Today’s totals</h2>
          <SummaryCard title="Estimated energy" value={props.nutrition ? `${props.nutrition.min}–${props.nutrition.max} kcal (approx.)` : "Not logged yet"} subtitle="Rough range only." />
          <SummaryCard title="Protein & fiber" value={props.nutrition ? `${Math.round(props.nutrition.protein)} g protein · ${Math.round(props.nutrition.fiber)} g fiber` : "Not logged yet"} />
          <SummaryCard title="Water" value={props.waterTotal ? `${props.waterTotal} oz` : "Not logged yet"} />
          <SummaryCard title="Movement" value={props.movement ? `${props.movement.minutes} min · ~${props.movement.burnMin}–${props.movement.burnMax} kcal` : "Not logged yet"} />
          <SummaryCard title="Cravings" value={props.cravingsCount ? `${props.cravingsCount} logged` : "Not logged yet"} />
          <SummaryCard title="Sleep & stress" value={props.sleepAvg != null || props.stressAvg != null ? `Sleep ~${(props.sleepAvg ?? "–")}/5 · Stress ~${(props.stressAvg ?? "–")}/5` : "Not logged yet"} />
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl bg-white/90 border border-attune-stone shadow-sm p-3">
      <p className="text-xs text-attune-slate mb-1">{title}</p>
      <p className="text-sm font-semibold text-attune-ink">{value}</p>
      {subtitle && <p className="text-xs text-attune-mist mt-1">{subtitle}</p>}
    </div>
  );
}
