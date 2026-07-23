-- Run this once in the Supabase SQL editor if your project was created
-- before candidate test answers were saved progressively (live) as they
-- fill in the test, instead of only once at final submission.

alter table test_results alter column behavioral_answers drop not null;
alter table test_results alter column sjt_answers drop not null;
alter table test_results alter column dimension_scores drop not null;
alter table test_results alter column behav_avg drop not null;
alter table test_results alter column sjt_score drop not null;
alter table test_results alter column sjt_total drop not null;
alter table test_results alter column global_score drop not null;
alter table test_results alter column recommendation drop not null;

alter table test_results add column if not exists is_complete boolean not null default false;
alter table test_results add column if not exists updated_at timestamptz not null default now();

-- Existing fully-submitted rows (created before this change) already have
-- every column filled in, so mark them as complete:
update test_results set is_complete = true where global_score is not null;
