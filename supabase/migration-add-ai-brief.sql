-- Run this in the Supabase SQL editor if your project was created BEFORE
-- the AI interview brief feature was added (i.e. you already ran the
-- original schema.sql once). Safe to run even if the column already exists.

alter table test_results add column if not exists ai_brief jsonb;
