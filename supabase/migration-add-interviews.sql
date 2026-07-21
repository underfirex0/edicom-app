-- Run this once in the Supabase SQL editor if your project was created
-- before the interview-scheduling feature was added.

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  interviewer text,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','no_show','cancelled')),
  outcome text check (outcome in ('hire','second_round','reject')),
  outcome_notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table interviews enable row level security;

create index if not exists idx_interviews_candidate on interviews(candidate_id);
create index if not exists idx_interviews_status on interviews(status);
