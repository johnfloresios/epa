create extension if not exists pgcrypto;

create unique index if not exists idx_questions_public_id_unique
  on public.questions (public_id);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  section_id uuid not null references public.certification_sections (id) on delete restrict,
  topic_id uuid references public.topics (id) on delete set null,
  question_count integer not null,
  correct_count integer not null default 0,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint practice_sessions_question_count_check
    check (question_count >= 1),
  constraint practice_sessions_correct_count_check
    check (correct_count >= 0 and correct_count <= question_count)
);

alter table public.practice_sessions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.practice_sessions
  add column if not exists section_id uuid references public.certification_sections (id) on delete restrict;

alter table public.practice_sessions
  add column if not exists topic_id uuid references public.topics (id) on delete set null;

alter table public.practice_sessions
  add column if not exists question_count integer not null default 1;

alter table public.practice_sessions
  add column if not exists correct_count integer not null default 0;

alter table public.practice_sessions
  add column if not exists started_at timestamptz not null default timezone('utc', now());

alter table public.practice_sessions
  add column if not exists completed_at timestamptz;

alter table public.practice_sessions
  add column if not exists created_at timestamptz not null default timezone('utc', now());

create table if not exists public.practice_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  section_id uuid not null references public.certification_sections (id) on delete restrict,
  topic_id uuid references public.topics (id) on delete set null,
  question_id uuid not null references public.questions (public_id) on delete restrict,
  question_version integer not null default 1,
  selected_choice_id uuid not null references public.question_choices (id) on delete restrict,
  is_correct boolean not null,
  answered_at timestamptz not null default timezone('utc', now()),
  constraint practice_answers_question_version_check
    check (question_version >= 1),
  constraint practice_answers_session_question_unique
    unique (session_id, question_id)
);

alter table public.practice_answers
  add column if not exists session_id uuid references public.practice_sessions (id) on delete cascade;

alter table public.practice_answers
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.practice_answers
  add column if not exists section_id uuid references public.certification_sections (id) on delete restrict;

alter table public.practice_answers
  add column if not exists topic_id uuid references public.topics (id) on delete set null;

alter table public.practice_answers
  add column if not exists question_id uuid references public.questions (public_id) on delete restrict;

alter table public.practice_answers
  add column if not exists question_version integer not null default 1;

alter table public.practice_answers
  add column if not exists selected_choice_id uuid references public.question_choices (id) on delete restrict;

alter table public.practice_answers
  add column if not exists is_correct boolean not null default false;

alter table public.practice_answers
  add column if not exists answered_at timestamptz not null default timezone('utc', now());

create index if not exists idx_practice_sessions_user_completed
  on public.practice_sessions (user_id, completed_at desc);

create index if not exists idx_practice_sessions_user_section
  on public.practice_sessions (user_id, section_id);

create index if not exists idx_practice_sessions_user_topic
  on public.practice_sessions (user_id, topic_id);

create index if not exists idx_practice_answers_user_answered
  on public.practice_answers (user_id, answered_at desc);

create index if not exists idx_practice_answers_session
  on public.practice_answers (session_id);

create index if not exists idx_practice_answers_question
  on public.practice_answers (question_id);

create index if not exists idx_practice_answers_user_section
  on public.practice_answers (user_id, section_id);

create index if not exists idx_practice_answers_user_topic
  on public.practice_answers (user_id, topic_id);

alter table public.practice_sessions enable row level security;
alter table public.practice_answers enable row level security;

drop policy if exists "Users can read their own practice sessions" on public.practice_sessions;
create policy "Users can read their own practice sessions"
on public.practice_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own practice sessions" on public.practice_sessions;
create policy "Users can insert their own practice sessions"
on public.practice_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own practice sessions" on public.practice_sessions;
create policy "Users can update their own practice sessions"
on public.practice_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own practice answers" on public.practice_answers;
create policy "Users can read their own practice answers"
on public.practice_answers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own practice answers" on public.practice_answers;
create policy "Users can insert their own practice answers"
on public.practice_answers
for insert
to authenticated
with check (auth.uid() = user_id);
