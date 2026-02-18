"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconSparkle } from "@/components/icons";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp" | "magicLink">("signIn");
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
    <div className="min-h-screen bg-[var(--sand)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(200, 122, 90, 0.12)" }}
            >
              <IconSparkle className="h-8 w-8 text-[var(--clay)]" />
            </div>
          </div>
          <CardTitle className="text-3xl font-canela">Attune</CardTitle>
          <CardDescription className="text-base mt-2">
            {mode === "magicLink"
              ? "Sign in with a magic link sent to your email"
              : mode === "signUp"
              ? "Create an account. We'll keep your data private."
              : "Welcome back. Let's check in."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "ok"
                  ? "text-[var(--clay)] bg-[rgba(200,122,90,0.1)]"
                  : "text-[var(--adobe)] bg-[rgba(182,94,60,0.1)]"
              }`}
            >
              {message.text}
            </div>
          )}

          {magicLinkSent ? (
            <p className="text-[var(--dust)] text-sm">We sent a link to {email}. Click it to sign in.</p>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mode === "magicLink") return handleMagicLink(e);
                  if (mode === "signUp") return handleSignUp(e);
                  return handleSignIn(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {mode !== "magicLink" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Loading…"
                    : mode === "magicLink"
                    ? "Send Magic Link"
                    : mode === "signUp"
                    ? "Create account"
                    : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 pt-4 border-t border-[var(--dust)] space-y-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "magicLink" ? "signIn" : "magicLink")}
                  className="text-sm text-[var(--clay)] hover:underline"
                >
                  {mode === "magicLink" ? "Use password instead" : "Prefer a magic link? Email me a sign-in link"}
                </button>
                {mode !== "magicLink" && (
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signUp" ? "signIn" : "signUp")}
                    className="block w-full text-center text-sm text-[var(--dust)] hover:text-[var(--basalt)]"
                  >
                    {mode === "signUp" ? "Already have an account? Sign in" : "Create account"}
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Link href="/" className="absolute top-4 left-4 text-sm text-[var(--dust)] hover:text-[var(--basalt)]">
        ← Back
      </Link>
    </div>
  );
}
