-- =========================================================
-- EDICOM — Qualification commerciale B2B — Supabase schema
-- Run this once in the Supabase SQL editor of a fresh project.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- Tables ----------

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'candidate' check (role in ('admin','candidate')),
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists candidates (
  id uuid primary key references profiles(id) on delete cascade,
  position text not null default 'Commercial(e) Terrain B2B',
  status text not null default 'invited'
    check (status in ('invited','in_progress','completed','interviewed','hired','rejected')),
  invited_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists test_results (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references candidates(id) on delete cascade,
  application_info jsonb,
  open_responses jsonb,
  behavioral_answers jsonb,
  sjt_answers jsonb,
  dimension_scores jsonb,
  behav_avg int,
  sjt_score int,
  sjt_total int,
  global_score int,
  recommendation text check (recommendation in ('good','watch','risk')),
  ai_brief jsonb,
  is_complete boolean not null default false,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  admin_id uuid references profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists scoring_config (
  id int primary key default 1,
  behav_weight numeric not null default 0.45,
  sjt_weight numeric not null default 0.55,
  threshold_good int not null default 75,
  threshold_watch int not null default 55,
  constraint single_row check (id = 1)
);
insert into scoring_config (id) values (1) on conflict (id) do nothing;

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

-- ---------- Row Level Security ----------
-- All privileged writes (invite, scoring, notes, status changes) happen
-- server-side through the service-role key after the app verifies the
-- caller's role in code (see lib/auth.ts). RLS below only grants each
-- signed-in user read access to their own row — everything else is
-- denied by default for the anon/authenticated keys.

alter table profiles enable row level security;
alter table candidates enable row level security;
alter table test_results enable row level security;
alter table candidate_notes enable row level security;
alter table scoring_config enable row level security;
alter table interviews enable row level security;

create policy "read own profile" on profiles
  for select using (id = auth.uid());

create policy "read own candidate row" on candidates
  for select using (id = auth.uid());

create policy "read own test result" on test_results
  for select using (candidate_id = auth.uid());

-- candidate_notes and scoring_config: no policies for anon/authenticated —
-- only the service-role key (used in Server Actions) can read/write them.

-- ---------- Indexes ----------
create index if not exists idx_candidates_status on candidates(status);
create index if not exists idx_test_results_candidate on test_results(candidate_id);
create index if not exists idx_notes_candidate on candidate_notes(candidate_id);
create index if not exists idx_interviews_candidate on interviews(candidate_id);
create index if not exists idx_interviews_status on interviews(status);
