import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: prefs } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();

  return (
    <SettingsClient
      userId={user.id}
      initialPrefs={{
        dietary_vegetarian: prefs?.dietary_vegetarian ?? false,
        avoid_weight_language: prefs?.avoid_weight_language ?? true,
        units_oz: prefs?.units_oz ?? true,
      }}
    />
  );
}
