-- Add carbs, fat, sugar to daily_rollups view (food_logs already has carbs_g, fat_g, sugar_g)
create or replace view public.daily_rollups as
with all_dates as (
  select user_id, timestamp::date as date from public.food_logs
  union select user_id, timestamp::date from public.water_logs
  union select user_id, timestamp::date from public.movement_logs
  union select user_id, timestamp::date from public.sleep_logs
  union select user_id, timestamp::date from public.stress_logs
  union select user_id, timestamp::date from public.craving_logs
),
distinct_dates as (
  select distinct user_id, date from all_dates
)
select
  dd.date,
  dd.user_id,
  coalesce((select sum(calories_min) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::int as calories_min_total,
  coalesce((select sum(calories_max) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::int as calories_max_total,
  coalesce((select sum(protein_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as protein_total,
  coalesce((select sum(fiber_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as fiber_total,
  coalesce((select sum(carbs_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as carbs_total,
  coalesce((select sum(fat_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as fat_total,
  coalesce((select sum(sugar_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as sugar_total,
  coalesce((select sum(ounces) from public.water_logs w where w.user_id = dd.user_id and w.timestamp::date = dd.date), 0)::numeric(10,1) as water_total,
  coalesce((select sum(duration_min) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as movement_min_total,
  coalesce((select sum(estimated_burn_min) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as burn_min_total,
  coalesce((select sum(estimated_burn_max) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as burn_max_total,
  (select count(*) from public.craving_logs c where c.user_id = dd.user_id and c.timestamp::date = dd.date)::int as cravings_count,
  (select avg(intensity) from public.craving_logs c where c.user_id = dd.user_id and c.timestamp::date = dd.date) as cravings_avg_intensity,
  (select avg(sleep_quality) from public.sleep_logs s where s.user_id = dd.user_id and s.timestamp::date = dd.date) as sleep_quality_avg,
  (select avg(stress_level) from public.stress_logs s where s.user_id = dd.user_id and s.timestamp::date = dd.date) as stress_level_avg
from distinct_dates dd;
