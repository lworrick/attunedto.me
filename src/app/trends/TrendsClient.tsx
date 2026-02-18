"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MainNav } from "@/components/MainNav";

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
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Trends</h1>
        <p className="text-sm text-attune-slate mb-4">Gentle overviews of how things have been lately.</p>

        <div className="flex gap-2 mb-6">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setRange(d)} className={`rounded-full px-3 py-1 text-xs border tap-target ${range === d ? "bg-attune-sage text-white border-attune-sage" : "border-attune-stone text-attune-slate"}`}>
              {d} days
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-attune-slate">Loading…</p>}
        {!loading && rollups.length === 0 && <p className="text-sm text-attune-slate">Log for a few days to see trends here.</p>}

        {!loading && rollups.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="rounded-2xl bg-white/80 border border-attune-stone p-3 text-sm">
              <p className="text-xs text-attune-slate mb-1">Days with data</p>
              <p className="text-attune-ink">{rollups.length} days</p>
            </div>
          </div>
        )}

        {insights && (
          <section className="rounded-2xl bg-white/80 border border-attune-stone p-4 text-sm space-y-3">
            <h2 className="text-sm font-medium text-attune-ink">Trend insights</h2>
            {insights.patterns?.length ? (
              <div>
                <p className="text-xs text-attune-slate mb-1">Patterns I’m noticing</p>
                <ul className="list-disc list-inside text-attune-slate space-y-1">{insights.patterns.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            ) : null}
            {insights.influences?.length ? (
              <div>
                <p className="text-xs text-attune-slate mb-1">What might be influencing this</p>
                <ul className="list-disc list-inside text-attune-slate space-y-1">{insights.influences.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            ) : null}
            {insights.experiment && <p className="text-attune-slate"><span className="font-medium">One small experiment to try: </span>{insights.experiment}</p>}
            {insights.supportive_line && <p className="text-attune-slate">{insights.supportive_line}</p>}
          </section>
        )}
      </div>
      <MainNav />
    </div>
  );
}
