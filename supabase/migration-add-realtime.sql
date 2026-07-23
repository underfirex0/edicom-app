-- Run this once in the Supabase SQL editor if your project was created
-- before instant (non-polling) live updates on the candidate detail page.
-- This lets an admin's browser subscribe directly to a candidate's test
-- progress instead of waiting for the next periodic refresh.

create or replace function is_admin() returns boolean
language sql security definer stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "admins read all test_results" on test_results;
create policy "admins read all test_results" on test_results
  for select using (is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'test_results'
  ) then
    alter publication supabase_realtime add table test_results;
  end if;
end $$;
