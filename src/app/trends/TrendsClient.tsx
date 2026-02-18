"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";

type Range = 7 | 30 | 90;

export function TrendsClient() {
  const supabase = createClient();
  const [range, setRange] = useState<Range>(7);
  const [rollups, setRollups] = useState<Record<string, unknown>[]>([]);
  const [insights, setInsights] = useState<{ patterns?: string[]; influences?: string[]; experiment?: string; supportive_line?: string } | null>(null);
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
      const all = (rollRes.data ?? []).filter((r) => r.user_id === uid);
      setRollups(all);
      setLoading(false);
      if (all.length > 0) {
        supabase.functions.invoke("trend-insights", { body: { daily_rollups: all } }).then(({ data }) => {
          if (data) setInsights(data as { patterns?: string[]; influences?: string[]; experiment?: string; supportive_line?: string });
        });
      }
    });
  }, [range, supabase]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Trends</h1>
        <p className="text-sm text-[var(--dust)] mb-4">Gentle overviews of how things have been lately.</p>

        <div className="flex gap-2 mb-6">
          {([7, 30, 90] as const).map((d) => (
            <Button key={d} variant={range === d ? "primary" : "outline"} size="sm" className="rounded-full" onClick={() => setRange(d)}>
              {d} days
            </Button>
          ))}
        </div>

        {loading && <p className="text-sm text-[var(--dust)]">Loading…</p>}
        {!loading && rollups.length === 0 && <p className="text-sm text-[var(--dust)]">Log for a few days to see trends here.</p>}

        {!loading && rollups.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="rounded-lg border border-[var(--dust)] bg-[var(--bone)] p-3 text-sm">
              <p className="text-xs text-[var(--dust)] mb-1">Days with data</p>
              <p className="text-[var(--basalt)]">{rollups.length} days</p>
            </div>
          </div>
        )}

        {insights && (
          <section className="rounded-lg border border-[var(--dust)] bg-[var(--bone)] p-4 text-sm space-y-3">
            <h2 className="text-sm font-medium text-[var(--basalt)]">Trend insights</h2>
            {insights.patterns?.length ? (
              <div>
                <p className="text-xs text-[var(--dust)] mb-1">Patterns I’m noticing</p>
                <ul className="list-disc list-inside text-[var(--dust)] space-y-1">{insights.patterns.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            ) : null}
            {insights.influences?.length ? (
              <div>
                <p className="text-xs text-[var(--dust)] mb-1">What might be influencing this</p>
                <ul className="list-disc list-inside text-[var(--dust)] space-y-1">{insights.influences.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            ) : null}
            {insights.experiment && <p className="text-[var(--dust)]"><span className="font-medium">One small experiment to try: </span>{insights.experiment}</p>}
            {insights.supportive_line && <p className="text-[var(--dust)]">{insights.supportive_line}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
