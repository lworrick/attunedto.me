import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TodayClient } from "./TodayClient";

export default async function TodayPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const today = new Date().toISOString().slice(0, 10);
  const todayEnd = today + "T23:59:59.999Z";

  const [foodRes, waterRes, moveRes, cravingRes, sleepRes, stressRes] = await Promise.all([
    supabase.from("food_logs").select("calories_min, calories_max, protein_g, carbs_g, fat_g, fiber_g, sugar_g").gte("timestamp", today).lt("timestamp", todayEnd),
    supabase.from("water_logs").select("ounces").gte("timestamp", today).lt("timestamp", todayEnd),
    supabase.from("movement_logs").select("duration_min, estimated_burn_min, estimated_burn_max").gte("timestamp", today).lt("timestamp", todayEnd),
    supabase.from("craving_logs").select("intensity").gte("timestamp", today).lt("timestamp", todayEnd),
    supabase.from("sleep_logs").select("sleep_quality").gte("timestamp", today).lt("timestamp", todayEnd),
    supabase.from("stress_logs").select("stress_level").gte("timestamp", today).lt("timestamp", todayEnd),
  ]);

  const nutrition = foodRes.data?.length
    ? {
        min: foodRes.data.reduce((s, r) => s + (r.calories_min ?? 0), 0),
        max: foodRes.data.reduce((s, r) => s + (r.calories_max ?? 0), 0),
        protein: foodRes.data.reduce((s, r) => s + (r.protein_g ?? 0), 0),
        carbs: foodRes.data.reduce((s, r) => s + (r.carbs_g ?? 0), 0),
        fat: foodRes.data.reduce((s, r) => s + (r.fat_g ?? 0), 0),
        fiber: foodRes.data.reduce((s, r) => s + (r.fiber_g ?? 0), 0),
        sugar: foodRes.data.reduce((s, r) => s + ((r as { sugar_g?: number }).sugar_g ?? 0), 0),
      }
    : null;
  const waterTotal = waterRes.data?.reduce((s, r) => s + Number(r.ounces), 0) ?? 0;
  const movement = moveRes.data?.length
    ? {
        minutes: moveRes.data.reduce((s, r) => s + (r.duration_min ?? 0), 0),
        burnMin: moveRes.data.reduce((s, r) => s + (r.estimated_burn_min ?? 0), 0),
        burnMax: moveRes.data.reduce((s, r) => s + (r.estimated_burn_max ?? 0), 0),
      }
    : null;
  const cravingsCount = cravingRes.data?.length ?? 0;
  const cravingsAvgIntensity = cravingRes.data?.length
    ? cravingRes.data.reduce((s, r) => s + (r.intensity ?? 0), 0) / cravingRes.data.filter((r) => r.intensity != null).length || 0
    : 0;
  const sleepAvg = sleepRes.data?.length ? sleepRes.data.reduce((s, r) => s + r.sleep_quality, 0) / sleepRes.data.length : null;
  const stressAvg = stressRes.data?.length ? stressRes.data.reduce((s, r) => s + r.stress_level, 0) / stressRes.data.length : null;

  return (
    <TodayClient
      nutrition={nutrition}
      waterTotal={waterTotal}
      movement={movement}
      cravingsCount={cravingsCount}
      cravingsAvgIntensity={cravingsAvgIntensity}
      sleepAvg={sleepAvg}
      stressAvg={stressAvg}
    />
  );
}
