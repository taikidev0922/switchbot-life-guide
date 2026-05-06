alter table public.keyword_candidates
  add column if not exists project_key text not null default 'switchbot-life-guide';

alter table public.keyword_usage_events
  add column if not exists project_key text not null default 'switchbot-life-guide';

alter table public.keyword_refresh_runs
  add column if not exists project_key text not null default 'switchbot-life-guide';

create unique index if not exists keyword_candidates_project_keyword_key
  on public.keyword_candidates (project_key, keyword);

create index if not exists keyword_candidates_project_selection_idx
  on public.keyword_candidates (project_key, usage_count asc, last_used_at asc nulls first, discovered_at desc);

create index if not exists keyword_refresh_runs_project_provider_created_idx
  on public.keyword_refresh_runs (project_key, provider, created_at desc);

create or replace function public.increment_keyword_usage(target_project_key text, target_keyword text)
returns void as $$
begin
  update public.keyword_candidates
  set
    usage_count = usage_count + 1,
    last_used_at = now(),
    updated_at = now()
  where project_key = target_project_key
    and keyword = target_keyword;
end;
$$ language plpgsql security definer;

create or replace function public.increment_keyword_usage(target_keyword text)
returns void as $$
begin
  update public.keyword_candidates
  set
    usage_count = usage_count + 1,
    last_used_at = now(),
    updated_at = now()
  where keyword = target_keyword;
end;
$$ language plpgsql security definer;
