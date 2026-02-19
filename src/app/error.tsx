"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error.message, error.digest);
  }, [error]);

  const isEnvError = error.message?.includes("NEXT_PUBLIC_SUPABASE");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--sand)] text-[var(--basalt)]">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--dust)] mb-4">
          {isEnvError
            ? "Supabase isn’t configured for this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy."
            : "A server error occurred. Try again or check your deployment logs."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-[var(--clay)] text-[var(--bone)] text-sm font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-[var(--dust)] text-sm font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
