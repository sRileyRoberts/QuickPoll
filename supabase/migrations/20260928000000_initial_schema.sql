-- QuickPoll initial Supabase schema
-- Phase 2: database tables, relationships, timestamps, and row level security.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamp with time zone not null default now()
);

comment on table public.profiles is
  'Application profile data for Supabase Auth users. The id matches auth.users.id.';

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text,
  question text not null check (length(trim(question)) > 0),
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.polls is
  'Polls created by authenticated users. Published polls can be opened through public links.';

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null check (length(trim(option_text)) > 0),
  display_order integer not null check (display_order > 0),
  created_at timestamp with time zone not null default now(),
  unique (poll_id, id),
  unique (poll_id, display_order)
);

comment on table public.poll_options is
  'Answer choices for a poll. display_order controls the order shown to voters.';

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null,
  created_at timestamp with time zone not null default now(),
  foreign key (poll_id, option_id)
    references public.poll_options(poll_id, id)
    on delete cascade
);

comment on table public.votes is
  'Anonymous vote records for published polls.';

create index polls_owner_id_idx on public.polls(owner_id);
create index poll_options_poll_id_idx on public.poll_options(poll_id);
create index votes_poll_id_idx on public.votes(poll_id);
create index votes_option_id_idx on public.votes(option_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_polls_updated_at
before update on public.polls
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

revoke all privileges on public.profiles from anon, authenticated;
revoke all privileges on public.polls from anon, authenticated;
revoke all privileges on public.poll_options from anon, authenticated;
revoke all privileges on public.votes from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on public.polls to anon;
grant select on public.poll_options to anon;
grant insert on public.votes to anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.polls to authenticated;
grant select, insert, update, delete on public.poll_options to authenticated;
grant select, insert on public.votes to authenticated;

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Owners can create polls"
on public.polls
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Owners and public visitors can read polls"
on public.polls
for select
to anon, authenticated
using (
  is_published = true
  or auth.uid() = owner_id
);

create policy "Owners can update polls"
on public.polls
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners can delete polls"
on public.polls
for delete
to authenticated
using (auth.uid() = owner_id);

create policy "Owners can create poll options"
on public.poll_options
for insert
to authenticated
with check (
  exists (
    select 1
    from public.polls
    where polls.id = poll_options.poll_id
      and polls.owner_id = auth.uid()
  )
);

create policy "Owners and public visitors can read poll options"
on public.poll_options
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.polls
    where polls.id = poll_options.poll_id
      and (
        polls.is_published = true
        or polls.owner_id = auth.uid()
      )
  )
);

create policy "Owners can update poll options"
on public.poll_options
for update
to authenticated
using (
  exists (
    select 1
    from public.polls
    where polls.id = poll_options.poll_id
      and polls.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.polls
    where polls.id = poll_options.poll_id
      and polls.owner_id = auth.uid()
  )
);

create policy "Owners can delete poll options"
on public.poll_options
for delete
to authenticated
using (
  exists (
    select 1
    from public.polls
    where polls.id = poll_options.poll_id
      and polls.owner_id = auth.uid()
  )
);

create policy "Anyone can vote on published polls"
on public.votes
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.polls
    join public.poll_options
      on poll_options.poll_id = polls.id
    where polls.id = votes.poll_id
      and poll_options.id = votes.option_id
      and polls.is_published = true
  )
);

create policy "Poll owners can read votes for their polls"
on public.votes
for select
to authenticated
using (
  exists (
    select 1
    from public.polls
    where polls.id = votes.poll_id
      and polls.owner_id = auth.uid()
  )
);
