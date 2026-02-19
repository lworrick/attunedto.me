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
  nutrition: { min: number; max: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number } | null;
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
  const [liveData, setLiveData] = useState<Props | null>(null);
  const [foodLogsCount, setFoodLogsCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();

  const display = liveData ?? props;

  const refetchToday = () => {
    setRefreshing(true);
    const n = new Date();
    const y = n.getFullYear();
    const m = n.getMonth();
    const d = n.getDate();
    const todayStart = new Date(y, m, d, 0, 0, 0, 0).toISOString();
    const todayEnd = new Date(y, m, d, 23, 59, 59, 999).toISOString();
    Promise.all([
      supabase.from("food_logs").select("calories_min, calories_max, protein_g, carbs_g, fat_g, fiber_g, sugar_g").gte("timestamp", todayStart).lt("timestamp", todayEnd),
      supabase.from("water_logs").select("ounces").gte("timestamp", todayStart).lt("timestamp", todayEnd),
      supabase.from("movement_logs").select("duration_min, estimated_burn_min, estimated_burn_max").gte("timestamp", todayStart).lt("timestamp", todayEnd),
      supabase.from("craving_logs").select("intensity").gte("timestamp", todayStart).lt("timestamp", todayEnd),
      supabase.from("sleep_logs").select("sleep_quality").gte("timestamp", todayStart).lt("timestamp", todayEnd),
      supabase.from("stress_logs").select("stress_level").gte("timestamp", todayStart).lt("timestamp", todayEnd),
    ]).then(([foodRes, waterRes, moveRes, cravingRes, sleepRes, stressRes]) => {
      const food = foodRes.data ?? [];
      const nutrition = food.length
        ? {
            min: food.reduce((s, r) => s + (r.calories_min ?? 0), 0),
            max: food.reduce((s, r) => s + (r.calories_max ?? 0), 0),
            protein: food.reduce((s, r) => s + (r.protein_g ?? 0), 0),
            carbs: food.reduce((s, r) => s + (r.carbs_g ?? 0), 0),
            fat: food.reduce((s, r) => s + (r.fat_g ?? 0), 0),
            fiber: food.reduce((s, r) => s + (r.fiber_g ?? 0), 0),
            sugar: food.reduce((s, r) => s + ((r as { sugar_g?: number }).sugar_g ?? 0), 0),
          }
        : null;
      const waterTotal = (waterRes.data ?? []).reduce((s, r) => s + Number(r.ounces), 0);
      const move = moveRes.data ?? [];
      const movement = move.length
        ? {
            minutes: move.reduce((s, r) => s + (r.duration_min ?? 0), 0),
            burnMin: move.reduce((s, r) => s + (r.estimated_burn_min ?? 0), 0),
            burnMax: move.reduce((s, r) => s + (r.estimated_burn_max ?? 0), 0),
          }
        : null;
      const cravings = cravingRes.data ?? [];
      const cravingsCount = cravings.length;
      const cravingsAvgIntensity = cravings.length ? cravings.reduce((s, r) => s + (r.intensity ?? 0), 0) / cravings.filter((r) => r.intensity != null).length || 0 : 0;
      const sleep = sleepRes.data ?? [];
      const stress = stressRes.data ?? [];
      const sleepAvg = sleep.length ? sleep.reduce((s, r) => s + r.sleep_quality, 0) / sleep.length : null;
      const stressAvg = stress.length ? stress.reduce((s, r) => s + r.stress_level, 0) / stress.length : null;
      setFoodLogsCount(food.length);
      setLiveData({
        nutrition,
        waterTotal,
        movement,
        cravingsCount,
        cravingsAvgIntensity,
        sleepAvg,
        stressAvg,
      });
    })
    .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    refetchToday();
  }, []);

  useEffect(() => {
    const onFocus = () => refetchToday();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const interval = setInterval(refetchToday, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const body = {
      nutrition: display.nutrition ? { calories_min: display.nutrition.min, calories_max: display.nutrition.max, protein: display.nutrition.protein, fiber: display.nutrition.fiber } : null,
      water: display.waterTotal || undefined,
      cravings: display.cravingsCount ? { count: display.cravingsCount, avg_intensity: display.cravingsAvgIntensity } : null,
      movement: display.movement ? { minutes: display.movement.minutes, burn_min: display.movement.burnMin, burn_max: display.movement.burnMax } : null,
      sleep_quality_avg: display.sleepAvg ?? undefined,
      stress_level_avg: display.stressAvg ?? undefined,
    };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(`${url}/functions/v1/daily-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })))
      .then(({ ok, status, data }) => {
        if (!ok) {
          const obj = data && typeof data === "object" ? (data as { error?: string; details?: string }) : null;
          const msg = obj?.error ?? `Snapshot couldn’t load (${status}). Try Generate below.`;
          const details = obj?.details ? ` ${obj.details}` : "";
          setSnapshotError(msg + details);
        } else if (data && !(typeof data === "object" && "error" in data)) {
          setSnapshotError(null);
          setSnapshot(data as { summary_text?: string; suggestion?: string; supportive_line?: string });
        }
      })
      .catch((err) => {
        console.warn("[daily-summary]", err);
        setSnapshotError("Snapshot is taking a short break. Try Generate below.");
      });
  }, [display.nutrition, display.waterTotal, display.movement, display.cravingsCount, display.cravingsAvgIntensity, display.sleepAvg, display.stressAvg]);

  function handleGenerateInsights() {
    setInsightsLoading(true);
    setSnapshotError(null);
    const body = {
      nutrition: display.nutrition ? { calories_min: display.nutrition.min, calories_max: display.nutrition.max, protein: display.nutrition.protein, fiber: display.nutrition.fiber } : null,
      water: display.waterTotal || undefined,
      cravings: display.cravingsCount ? { count: display.cravingsCount, avg_intensity: display.cravingsAvgIntensity } : null,
      movement: display.movement ? { minutes: display.movement.minutes, burn_min: display.movement.burnMin, burn_max: display.movement.burnMax } : null,
      sleep_quality_avg: display.sleepAvg ?? undefined,
      stress_level_avg: display.stressAvg ?? undefined,
    };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setInsightsLoading(false);
      return;
    }
    fetch(`${url}/functions/v1/daily-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })))
      .then(({ ok, status, data }) => {
        setInsightsLoading(false);
        if (ok && data && !(typeof data === "object" && "error" in data)) {
          setSnapshotError(null);
          setSnapshot(data as { summary_text?: string; suggestion?: string; supportive_line?: string });
        } else {
          const obj = data && typeof data === "object" ? (data as { error?: string; details?: string }) : null;
          const msg = obj?.error ?? `Snapshot couldn’t load (${status}). Try again in a moment.`;
          const details = obj?.details ? ` ${obj.details}` : "";
          setSnapshotError(msg + details);
        }
      })
      .catch((err) => {
        console.warn("[daily-summary]", err);
        setInsightsLoading(false);
        setSnapshotError("Snapshot is taking a short break. Try again in a moment.");
      });
  }

  const hasSnapshot = snapshot?.summary_text || snapshot?.suggestion || snapshot?.supportive_line;

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <TopBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl text-[var(--basalt)] font-canela">Today</h1>
              <p className="text-[var(--dust)] mt-1">{formatTodayDate()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchToday()} disabled={refreshing}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
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
                    <span style={{ color: iconColor }}>
                      <Icon className="h-6 w-6" />
                    </span>
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
                    {display.nutrition && display.nutrition.min > 0
                      ? `${display.nutrition.min}–${display.nutrition.max} (approx.)`
                      : "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 text-sm">
                  <div>
                    <p className="text-xs text-[var(--dust)]">Protein</p>
                    <p className="font-medium text-[var(--basalt)]">{display.nutrition ? Math.round(display.nutrition.protein) : 0}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--dust)]">Carbs</p>
                    <p className="font-medium text-[var(--basalt)]">{display.nutrition ? Math.round(display.nutrition.carbs) : 0}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--dust)]">Fat</p>
                    <p className="font-medium text-[var(--basalt)]">{display.nutrition ? Math.round(display.nutrition.fat) : 0}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--dust)]">Fiber</p>
                    <p className="font-medium text-[var(--basalt)]">{display.nutrition ? Math.round(display.nutrition.fiber) : 0}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--dust)]">Sugar</p>
                    <p className="font-medium text-[var(--basalt)]">{display.nutrition ? Math.round(display.nutrition.sugar) : 0}g</p>
                  </div>
                </div>
                {foodLogsCount != null && foodLogsCount > 0 && display.nutrition && display.nutrition.min === 0 && (
                  <p className="text-xs text-[var(--dust)] pt-1">
                    If you just logged food, estimates can take a minute. Tap Refresh above to update.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hydration & Movement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--dust)]">Water</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">{display.waterTotal || 0} oz</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--dust)]">Movement</p>
                  <p className="text-2xl font-medium text-[var(--basalt)]">{display.movement?.minutes ?? 0} min</p>
                  {display.movement && (display.movement.burnMin > 0 || display.movement.burnMax > 0) && (
                    <p className="text-xs text-[var(--dust)] mt-1">Est. {display.movement.burnMin}–{display.movement.burnMax} cal burned</p>
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
                  <p className="text-2xl font-medium text-[var(--basalt)]">{display.cravingsCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--dust)]">Sleep & stress</p>
                  <p className="font-medium text-[var(--basalt)]">
                    Sleep ~{display.sleepAvg != null ? display.sleepAvg.toFixed(1) : "–"}/5 · Stress ~{display.stressAvg != null ? display.stressAvg.toFixed(1) : "–"}/5
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
