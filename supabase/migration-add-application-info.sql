-- Run this once in the Supabase SQL editor if your project was created
-- before the personal info / background / motivation / open-question
-- sections were added to the candidate test.

alter table test_results add column if not exists application_info jsonb;
alter table test_results add column if not exists open_responses jsonb;
