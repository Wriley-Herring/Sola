do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passage_insight_cache'
      and column_name = 'normalized_passage_reference'
  ) then
    alter table public.passage_insight_cache
      rename column normalized_passage_reference to normalized_reference;
  end if;
end
$$;

alter table public.passage_insight_cache
  add column if not exists model text,
  add column if not exists prompt_version text,
  add column if not exists generated_at timestamptz not null default now();

update public.passage_insight_cache
set
  model = coalesce(model, 'legacy-mock'),
  prompt_version = coalesce(prompt_version, 'v0')
where model is null or prompt_version is null;

alter table public.passage_insight_cache
  alter column model set not null,
  alter column prompt_version set not null;

create unique index if not exists passage_insight_cache_normalized_reference_uq
  on public.passage_insight_cache(normalized_reference);
