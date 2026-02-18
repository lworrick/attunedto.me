"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";

type Tab = "food" | "water" | "cravings" | "movement" | "sleep" | "stress";

export function HistoryClient() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("food");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const table =
      tab === "food" ? "food_logs" :
      tab === "water" ? "water_logs" :
      tab === "cravings" ? "craving_logs" :
      tab === "movement" ? "movement_logs" :
      tab === "sleep" ? "sleep_logs" : "stress_logs";

    supabase.from(table).select("*").order("timestamp", { ascending: false }).limit(100).then(({ data }) => {
      setRows(data ?? []);
      setLoading(false);
    });
  }, [tab, supabase]);

  const grouped = rows.reduce<Record<string, Record<string, unknown>[]>>((acc, row) => {
    const ts = (row.timestamp as string) ?? "";
    const key = new Date(ts).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  function getLabel(row: Record<string, unknown>): string {
    if (tab === "food") return (row.text as string) ?? "";
    if (tab === "water") return `${row.ounces} oz`;
    if (tab === "cravings") return (row.craving_text as string) ?? "";
    if (tab === "movement") return (row.raw_text as string) ?? `${row.activity_type ?? "movement"} · ${row.duration_min ?? "?"} min`;
    if (tab === "sleep") return `Sleep quality ${row.sleep_quality}/5`;
    return `Stress ${row.stress_level}/5`;
  }

  async function handleDelete(id: string) {
    const table =
      tab === "food" ? "food_logs" :
      tab === "water" ? "water_logs" :
      tab === "cravings" ? "craving_logs" :
      tab === "movement" ? "movement_logs" :
      tab === "sleep" ? "sleep_logs" : "stress_logs";
    await supabase.from(table).delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const tabs: Tab[] = ["food", "water", "cravings", "movement", "sleep", "stress"];
  const tabLabels: Record<Tab, string> = { food: "Food", water: "Water", cravings: "Cravings", movement: "Movement", sleep: "Sleep", stress: "Stress" };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">History</h1>
        <p className="text-sm text-[var(--dust)] mb-4">A gentle look back at what you’ve logged.</p>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <Button
            key={t}
            variant={tab === t ? "primary" : "outline"}
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() => { setTab(t); setLoading(true); }}
          >
            {tabLabels[t]}
          </Button>
          ))}
        </div>

        {loading && <p className="text-sm text-[var(--dust)]">Loading…</p>}
        {!loading && Object.keys(grouped).length === 0 && <p className="text-sm text-[var(--dust)]">Nothing logged here yet. That’s okay.</p>}
        {!loading &&
          Object.entries(grouped).map(([day, list]) => (
            <section key={day} className="mb-4">
              <p className="text-xs text-[var(--dust)] mb-2">{day}</p>
              <div className="space-y-2">
                {list.map((row) => (
                  <div key={String(row.id)} className="flex items-center justify-between rounded-lg border border-[var(--dust)] bg-[var(--bone)] px-3 py-2 text-sm">
                    <span className="flex-1 pr-2 text-[var(--basalt)] truncate">{getLabel(row)}</span>
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs text-[var(--dust)]" onClick={() => handleDelete(String(row.id))}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
