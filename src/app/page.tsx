import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/today");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-attune-sand">
      <div className="text-center max-w-sm">
        <h1 className="text-3xl font-semibold text-attune-ink mb-2">Attune</h1>
        <p className="text-attune-slate mb-8 text-lg">
          Gentle tracking for food, water, movement, sleep, and stress. Data, not drama.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth"
            className="bg-attune-sage text-white py-3 px-6 rounded-xl font-medium hover:bg-attune-sage/90 transition tap-target"
          >
            Sign in or sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
