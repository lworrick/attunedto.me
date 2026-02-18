import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/today");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 bg-[var(--sand)]">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-3xl font-canela text-[var(--basalt)] mb-2">Attune</h1>
        <p className="text-[var(--dust)] mb-8 text-lg">
          Gentle tracking for food, water, movement, sleep, and stress. Data, not drama.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth"
            className="bg-[var(--clay)] text-[var(--bone)] hover:bg-[var(--adobe)] py-3 px-6 rounded-lg font-medium transition tap-target text-center"
          >
            Sign in or sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
