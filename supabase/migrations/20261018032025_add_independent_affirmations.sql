create table public.affirmations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 phrase text not null check (length(btrim(phrase)) between 1 and 280),
 submission_ids uuid[] not null default '{}',
 repetitions integer generated always as (cardinality(submission_ids)) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (cardinality(submission_ids) <= 100)
);
create index affirmations_user_id_idx on public.affirmations(user_id);
create unique index affirmations_user_phrase_idx on public.affirmations(user_id, lower(regexp_replace(btrim(phrase), '\s+', ' ', 'g')));
alter table public.affirmations enable row level security;
revoke all on public.affirmations from anon, authenticated;
grant select, insert on public.affirmations to authenticated;
grant update(submission_ids,updated_at) on public.affirmations to authenticated;
create policy affirmations_read on public.affirmations for select to authenticated using ((select auth.uid()) = user_id);
create policy affirmations_create on public.affirmations for insert to authenticated with check ((select auth.uid()) = user_id and cardinality(submission_ids)=0);
create policy affirmations_update on public.affirmations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.submit_affirmation(p_id uuid, p_submission uuid, p_text text)
returns integer language plpgsql security invoker set search_path = '' as $$
declare item public.affirmations%rowtype;
begin
 select * into item from public.affirmations where id=p_id and user_id=(select auth.uid()) for update;
 if not found then raise exception 'Affirmation not found'; end if;
 if p_submission is null or p_text is null then raise exception 'Missing submission'; end if;
 if p_submission=any(item.submission_ids) then return item.repetitions; end if;
 if lower(regexp_replace(btrim(p_text), '\s+', ' ', 'g')) <> lower(regexp_replace(btrim(item.phrase), '\s+', ' ', 'g')) then raise exception 'Phrase mismatch'; end if;
 if item.repetitions>=100 then return 100; end if;
 update public.affirmations set submission_ids=array_append(submission_ids,p_submission),updated_at=now() where id=p_id;
 return item.repetitions+1;
end;
$$;
revoke all on function public.submit_affirmation(uuid,uuid,text) from public,anon;
grant execute on function public.submit_affirmation(uuid,uuid,text) to authenticated;
