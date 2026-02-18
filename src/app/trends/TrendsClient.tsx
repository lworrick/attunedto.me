"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Range = 7 | 30 | 90;

type Rollup = {
  date: string;
  user_id?: string;
  calories_min_total?: number;
  calories_max_total?: number;
  protein_total?: number;
  fiber_total?: number;
  water_total?: number;
  [k: string]: unknown;
};

function formatChartDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrendsClient() {
  const supabase = createClient();
  const [range, setRange] = useState<Range>(7);
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [insights, setInsights] = useState<{
    patterns?: string[];
    influences?: string[];
    experiment?: string;
    supportive_line?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    from.setDate(from.getDate() - range);
    const fromStr = from.toISOString().slice(0, 10);

    Promise.all([
      supabase.from("daily_rollups").select("*").gte("date", fromStr).order("date", { ascending: true }),
      supabase.auth.getUser(),
    ]).then(([rollRes, userRes]) => {
      const uid = userRes.data.user?.id;
      const all = ((rollRes.data ?? []) as Rollup[]).filter((r) => r.user_id === uid);
      setRollups(all);
      setLoading(false);
      if (all.length > 0) {
        supabase.functions.invoke("trend-insights", { body: { daily_rollups: all } }).then(({ data }) => {
          if (data) setInsights(data as typeof insights);
        });
      }
    });
  }, [range, supabase]);

  const chartData = rollups.map((r) => {
    const minCal = Number(r.calories_min_total) || 0;
    const maxCal = Number(r.calories_max_total) || 0;
    const midCal = minCal + maxCal ? Math.round((minCal + maxCal) / 2) : 0;
    return {
      date: r.date,
      label: formatChartDate(r.date),
      calories: midCal,
      protein: Number(r.protein_total) || 0,
      fiber: Number(r.fiber_total) || 0,
      water: Number(r.water_total) || 0,
    };
  });

  const commonChartProps = {
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
    className: "text-[var(--dust)]",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Trends</h1>
        <p className="text-sm text-[var(--dust)] mb-4">See patterns over time.</p>

        <div className="flex gap-2 mb-6">
          {([7, 30, 90] as const).map((d) => (
            <Button
              key={d}
              variant={range === d ? "primary" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setRange(d)}
            >
              {d} Days
            </Button>
          ))}
        </div>

        {loading && <p className="text-sm text-[var(--dust)]">Loading…</p>}
        {!loading && rollups.length === 0 && (
          <p className="text-sm text-[var(--dust)]">Log for a few days to see trends here.</p>
        )}

        {!loading && rollups.length > 0 && (
          <div className="space-y-6 mb-6">
            {/* Calories - daily calorie range (mid-point) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Calories</CardTitle>
                <p className="text-xs text-[var(--dust)]">Daily calorie range (mid-point)</p>
              </CardHeader>
              <CardContent className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} {...commonChartProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dust)" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--dust)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--dust)" width={24} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bone)",
                        border: "1px solid var(--dust)",
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="var(--clay)"
                      fill="var(--clay)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="cal (mid-point)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bottom two charts side by side on larger screens */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Protein & Fiber - grams per day */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Protein & Fiber</CardTitle>
                  <p className="text-xs text-[var(--dust)]">Grams per day</p>
                </CardHeader>
                <CardContent className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} {...commonChartProps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dust)" opacity={0.3} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--dust)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--dust)" width={24} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bone)",
                          border: "1px solid var(--dust)",
                          borderRadius: 8,
                        }}
                      />
                      <Line type="monotone" dataKey="protein" stroke="var(--clay)" strokeWidth={2} dot={{ r: 3 }} name="protein (g)" />
                      <Line type="monotone" dataKey="fiber" stroke="var(--sage)" strokeWidth={2} dot={{ r: 3 }} name="fiber (g)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Water - ounces per day */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Water Intake</CardTitle>
                  <p className="text-xs text-[var(--dust)]">Ounces per day</p>
                </CardHeader>
                <CardContent className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} {...commonChartProps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dust)" opacity={0.3} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--dust)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--dust)" width={24} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bone)",
                          border: "1px solid var(--dust)",
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="water" fill="var(--sage)" radius={[4, 4, 0, 0]} name="water (oz)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {insights && (
          <section className="rounded-lg border border-[var(--dust)] bg-[var(--bone)] p-4 text-sm space-y-3">
            <h2 className="text-sm font-medium text-[var(--basalt)]">Trend insights</h2>
            {insights.patterns?.length ? (
              <div>
                <p className="text-xs text-[var(--dust)] mb-1">Patterns I'm noticing</p>
                <ul className="list-disc list-inside text-[var(--dust)] space-y-1">
                  {insights.patterns.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {insights.influences?.length ? (
              <div>
                <p className="text-xs text-[var(--dust)] mb-1">What might be influencing this</p>
                <ul className="list-disc list-inside text-[var(--dust)] space-y-1">
                  {insights.influences.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {insights.experiment && (
              <p className="text-[var(--dust)]">
                <span className="font-medium">One small experiment to try: </span>
                {insights.experiment}
              </p>
            )}
            {insights.supportive_line && <p className="text-[var(--dust)]">{insights.supportive_line}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
