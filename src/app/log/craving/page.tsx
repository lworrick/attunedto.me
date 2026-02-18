"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["sweet", "salty", "crunchy", "creamy", "comforting", "quick energy"];

export default function LogCravingPage() {
  const supabase = createClient();
  const [text, setText] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ alternatives?: string[]; honor_option?: string; suggestion?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setSuggestions(null);

    const { data, error } = await supabase.functions.invoke("craving-alternatives", {
      body: { craving_text: text, intensity, category: category ?? undefined },
    });
    setLoading(false);
    if (error) {
      setSuggestions({ suggestion: "Suggestions are taking a short break. It’s okay to honor the craving if that feels right." });
      return;
    }
    if (data) setSuggestions(data as { alternatives?: string[]; honor_option?: string; suggestion?: string });
  }

  async function saveLog() {
    if (!text.trim()) return;
    await supabase.from("craving_logs").insert({
      craving_text: text,
      intensity,
      craving_category: category,
      suggestion_text: suggestions?.suggestion ?? null,
      alternatives_json: suggestions ? { alternatives: suggestions.alternatives, honor_option: suggestions.honor_option } : null,
    });
    setSaved(true);
    setText("");
    setIntensity(3);
    setCategory(null);
    setSuggestions(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sand)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <Link href="/today" className="text-sm text-[var(--dust)] mb-4 inline-block">← Today</Link>
        <h1 className="text-2xl font-canela text-[var(--basalt)] mb-1">Log craving</h1>
        <p className="text-sm text-[var(--dust)] mb-4">No judgment. Sometimes a gentle alternative helps; sometimes honoring it does.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are you craving?"
          />
          <div>
            <Label className="text-xs text-[var(--dust)] mb-1 block">Intensity (1–5)</Label>
            <input type="range" min={1} max={5} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-[var(--clay)]" />
            <span className="text-xs text-[var(--dust)]">{intensity}</span>
          </div>
          <div>
            <Label className="text-xs text-[var(--dust)] mb-2 block">Category (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Button key={c} type="button" variant={category === c ? "primary" : "outline"} size="sm" className="rounded-full" onClick={() => setCategory(category === c ? null : c)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || !text.trim()} className="w-full">
            {loading ? "Thinking…" : "Get gentle suggestions"}
          </Button>
        </form>

        {suggestions && (
          <Card className="mt-6">
            <CardContent className="p-4 text-sm space-y-3">
              {suggestions.alternatives?.length ? (
                <div>
                  <p className="text-xs text-[var(--dust)] mb-1">Alternatives you might try</p>
                  <ul className="list-disc list-inside text-[var(--basalt)] space-y-1">{suggestions.alternatives.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
              ) : null}
              {suggestions.honor_option && <p className="text-[var(--dust)]">{suggestions.honor_option}</p>}
              {suggestions.suggestion && <p className="text-[var(--dust)]">{suggestions.suggestion}</p>}
              {!saved && text.trim() && (
                <Button onClick={saveLog} size="sm">
                  Save to my log
                </Button>
              )}
              {saved && <p className="text-[var(--dust)]">Saved. Thanks for logging.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
