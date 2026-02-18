"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/TopBar";

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
    <div className="min-h-screen flex flex-col bg-attune-sand">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 max-w-md mx-auto">
        <Link href="/today" className="text-sm text-attune-slate mb-4 inline-block">← Today</Link>
        <h1 className="text-xl font-semibold text-attune-ink mb-1">Log craving</h1>
        <p className="text-sm text-attune-slate mb-4">No judgment. Sometimes a gentle alternative helps; sometimes honoring it does.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are you craving?"
            className="w-full rounded-2xl border border-attune-stone bg-white px-3 py-2 text-sm text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:outline-none"
          />
          <div>
            <p className="text-xs text-attune-slate mb-1">Intensity (1–5)</p>
            <input type="range" min={1} max={5} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full" />
            <span className="text-xs text-attune-slate">{intensity}</span>
          </div>
          <div>
            <p className="text-xs text-attune-slate mb-2">Category (optional)</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(category === c ? null : c)} className={`rounded-full px-3 py-1 text-xs border tap-target ${category === c ? "bg-attune-sage text-white border-attune-sage" : "border-attune-stone text-attune-slate"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || !text.trim()} className="w-full rounded-xl bg-attune-sage text-white py-3 text-sm font-medium disabled:opacity-60 tap-target">
            {loading ? "Thinking…" : "Get gentle suggestions"}
          </button>
        </form>

        {suggestions && (
          <div className="mt-6 rounded-2xl bg-white/80 border border-attune-stone p-4 text-sm space-y-3">
            {suggestions.alternatives?.length ? (
              <div>
                <p className="text-xs text-attune-slate mb-1">Alternatives you might try</p>
                <ul className="list-disc list-inside text-attune-ink space-y-1">{suggestions.alternatives.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            ) : null}
            {suggestions.honor_option && <p className="text-attune-slate">{suggestions.honor_option}</p>}
            {suggestions.suggestion && <p className="text-attune-slate">{suggestions.suggestion}</p>}
            {!saved && text.trim() && (
              <button onClick={saveLog} className="rounded-xl bg-attune-sage text-white py-2 px-4 text-sm tap-target">
                Save to my log
              </button>
            )}
            {saved && <p className="text-attune-slate">Saved. Thanks for logging.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
