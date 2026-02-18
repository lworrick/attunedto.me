"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "err", text: error.message });
      return;
    }
    setMessage({ type: "ok", text: "Check your email to confirm your account." });
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "err", text: error.message });
      return;
    }
    window.location.href = "/today";
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setMessage({ type: "err", text: error.message });
      return;
    }
    setMagicLinkSent(true);
    setMessage({ type: "ok", text: "Check your email for the sign-in link." });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-attune-sand">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block text-attune-slate hover:text-attune-ink mb-6">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-attune-ink mb-1">Welcome to Attune</h1>
        <p className="text-attune-slate mb-8">Sign in or create an account. We’ll keep your data private.</p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "ok" ? "bg-attune-sageLight/50 text-attune-slate" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {magicLinkSent ? (
          <p className="text-attune-slate text-sm">We sent a link to {email}. Click it to sign in.</p>
        ) : (
          <>
            <form onSubmit={handleSignIn} className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-attune-slate">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-attune-stone bg-white text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:ring-1 focus:ring-attune-sage"
              />
              <label className="block text-sm font-medium text-attune-slate">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-attune-stone bg-white text-attune-ink placeholder:text-attune-mist focus:border-attune-sage focus:ring-1 focus:ring-attune-sage"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-attune-sage text-white py-3 px-4 rounded-xl font-medium hover:bg-attune-sage/90 disabled:opacity-60 tap-target"
                >
                  {loading ? "Please wait…" : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="flex-1 border border-attune-stone text-attune-slate py-3 px-4 rounded-xl font-medium hover:bg-attune-stone/30 disabled:opacity-60 tap-target"
                >
                  Sign up
                </button>
              </div>
            </form>
            <form onSubmit={handleMagicLink} className="pt-4 border-t border-attune-stone">
              <p className="text-sm text-attune-slate mb-2">Prefer no password?</p>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full border border-attune-clay text-attune-slate py-3 px-4 rounded-xl font-medium hover:bg-attune-clayLight/30 disabled:opacity-60 tap-target"
              >
                Email me a sign-in link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
