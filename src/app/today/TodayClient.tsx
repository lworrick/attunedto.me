"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  { href: "/log/food", label: "Log Food", Icon: IconFood, bgColor: "rgba(200, 122, 90, 0.12)", iconColor: "var(--clay)" },
  { href: "/log/water", label: "Log Water", Icon: IconWater, bgColor: "rgba(124, 138, 122, 0.12)", iconColor: "var(--sage)" },
  { href: "/log/craving", label: "Log Craving", Icon: IconCraving, bgColor: "rgba(182, 94, 60, 0.12)", iconColor: "var(--adobe)" },
  { href: "/log/movement", label: "Log Movement", Icon: IconMovement, bgColor: "rgba(124, 138, 122, 0.12)", iconColor: "var(--sage)" },
  { href: "/log/sleep", label: "Log Sleep", Icon: IconSleep, bgColor: "rgba(184, 169, 153, 0.12)", iconColor: "var(--dust)" },
  { href: "/log/stress", label: "Log Stress", Icon: IconStress, bgColor: "rgba(200, 122, 90, 0.12)", iconColor: "var(--clay)" },
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
    <div className="min-h-screen bg-[var(--sand)]">
      <TopBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl text-[var(--basalt)] font-canela">Today</h1>
            <p className="text-[var(--dust)] mt-1">{formatTodayDate()}</p>
          </div>

          {/* Quick Actions - Figma style */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_LOGS.map(({ href, label, Icon, bgColor, iconColor }) => (
              <Link key={href} href={href}>
                <button
                  type="button"
                  className="w-full h-auto py-6 flex flex-col gap-3 rounded-xl border border-[var(--dust)] bg-[var(--bone)] shadow-sm hover:shadow-md transition-all duration-200 tap-target text-left items-center"
                >
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Icon className="h-6 w-6" style={{ color: iconColor }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--basalt)]">{label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Generate insights - Figma style */}
          <Card className="bg-gradient-to-br from-[rgba(124,138,122,0.08)] to-[rgba(200,122,90,0.08)] border-[var(--sage)]">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconSparkle className="h-4 w-4 text-[var(--sage)] shrink-0" />
                    <p className="text-sm font-medium text-[var(--basalt)]">Want personalized insights?</p>
                  </div>
                  <p className="text-xs text-[var(--dust)]">Generate AI insights from your last 14 days of tracking</p>
                </div>
                <Button
                  onClick={handleGenerateInsights}
                  disabled={insightsLoading}
                  size="sm"
                  className="shrink-0"
                >
                  <IconSparkle className="h-4 w-4 mr-2" />
                  {insightsLoading ? "Generating…" : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Welcome / Daily snapshot - Figma style */}
          <Card className={hasSnapshot ? "" : "bg-gradient-to-br from-[var(--bone)] to-[var(--sand)]"}>
            <CardContent className="pt-6">
              {hasSnapshot ? (
                <div className="text-sm space-y-2">
                  <h3 className="text-lg font-medium leading-none tracking-tight mb-2">Daily snapshot</h3>
                  {snapshot?.summary_text && <p className="whitespace-pre-line text-[var(--basalt)]">{snapshot.summary_text}</p>}
                  {snapshot?.suggestion && <p className="text-[var(--dust)]">If you’d like to try: {snapshot.suggestion}</p>}
                  {snapshot?.supportive_line && <p className="text-[var(--clay)] italic">{snapshot.supportive_line}</p>}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg text-[var(--basalt)] mb-2">Welcome to a fresh day! 🌅</p>
                  <p className="text-[var(--dust)]">
                    Start by logging your first activity using the buttons above. Your daily summary will appear here as you track your wellness journey.
                  </p>
                  {snapshotError && <p className="text-[var(--dust)] text-sm mt-2">{snapshotError}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's totals - Figma style cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutrition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--dust)]">Estimated calories</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">
                    {props.nutrition && props.nutrition.min > 0
                      ? `${props.nutrition.min}–${props.nutrition.max} (approx.)`
                      : "—"}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[var(--dust)]">Protein</p>
                    <p className="font-medium text-[var(--basalt)]">{props.nutrition ? Math.round(props.nutrition.protein) : 0}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--dust)]">Fiber</p>
                    <p className="font-medium text-[var(--basalt)]">{props.nutrition ? Math.round(props.nutrition.fiber) : 0}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hydration & Movement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--dust)]">Water</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">{props.waterTotal || 0} oz</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--dust)]">Movement</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">{props.movement?.minutes ?? 0} min</p>
                  {props.movement && (props.movement.burnMin > 0 || props.movement.burnMax > 0) && (
                    <p className="text-xs text-[var(--dust)] mt-1">Est. {props.movement.burnMin}–{props.movement.burnMax} cal burned</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cravings & Sleep</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--dust)]">Cravings logged</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">{props.cravingsCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--dust)]">Sleep & stress</p>
                  <p className="font-medium text-[var(--basalt)]">
                    Sleep ~{props.sleepAvg != null ? props.sleepAvg.toFixed(1) : "–"}/5 · Stress ~{props.stressAvg != null ? props.stressAvg.toFixed(1) : "–"}/5
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
