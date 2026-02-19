-- Add sugar_g to food_logs for nutrition estimates
alter table public.food_logs
  add column if not exists sugar_g numeric(6,1);
