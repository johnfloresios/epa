create extension if not exists pgcrypto;

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_type text not null,
  section_id uuid references public.certification_sections (id) on delete restrict,
  question_count integer not null default 1,
  answered_count integer not null default 0,
  correct_count integer not null default 0,
  score_percent double precision not null default 0,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint exam_attempts_exam_type_check
    check (exam_type in ('CORE', 'TYPE_I', 'TYPE_II', 'TYPE_III', 'UNIVERSAL')),
  constraint exam_attempts_question_count_check
    check (question_count >= 1),
  constraint exam_attempts_answered_count_check
    check (answered_count >= 0 and answered_count <= question_count),
  constraint exam_attempts_correct_count_check
    check (correct_count >= 0 and correct_count <= answered_count),
  constraint exam_attempts_score_percent_check
    check (score_percent >= 0 and score_percent <= 1),
  constraint exam_attempts_section_scope_check
    check (
      (exam_type = 'UNIVERSAL' and section_id is null)
      or (exam_type <> 'UNIVERSAL' and section_id is not null)
    )
);

alter table public.exam_attempts
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.exam_attempts
  add column if not exists exam_type text not null default 'CORE';

alter table public.exam_attempts
  add column if not exists section_id uuid references public.certification_sections (id) on delete restrict;

alter table public.exam_attempts
  add column if not exists question_count integer not null default 1;

alter table public.exam_attempts
  add column if not exists answered_count integer not null default 0;

alter table public.exam_attempts
  add column if not exists correct_count integer not null default 0;

alter table public.exam_attempts
  add column if not exists score_percent double precision not null default 0;

alter table public.exam_attempts
  add column if not exists started_at timestamptz not null default timezone('utc', now());

alter table public.exam_attempts
  add column if not exists completed_at timestamptz;

alter table public.exam_attempts
  add column if not exists created_at timestamptz not null default timezone('utc', now());

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  section_id uuid not null references public.certification_sections (id) on delete restrict,
  topic_id uuid references public.topics (id) on delete set null,
  question_order integer not null default 1,
  section_code text,
  section_name text,
  topic_name text,
  question_id uuid not null references public.questions (public_id) on delete restrict,
  question_version integer not null default 1,
  question_text text,
  explanation text,
  selected_choice_id uuid not null references public.question_choices (id) on delete restrict,
  selected_choice_text text,
  correct_choice_id uuid references public.question_choices (id) on delete set null,
  correct_choice_text text,
  is_correct boolean not null default false,
  answered_at timestamptz not null default timezone('utc', now()),
  constraint exam_answers_question_version_check
    check (question_version >= 1),
  constraint exam_answers_attempt_question_unique
    unique (exam_attempt_id, question_id)
);

alter table public.exam_answers
  add column if not exists exam_attempt_id uuid references public.exam_attempts (id) on delete cascade;

alter table public.exam_answers
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.exam_answers
  add column if not exists section_id uuid references public.certification_sections (id) on delete restrict;

alter table public.exam_answers
  add column if not exists topic_id uuid references public.topics (id) on delete set null;

alter table public.exam_answers
  add column if not exists question_order integer not null default 1;

alter table public.exam_answers
  add column if not exists section_code text;

alter table public.exam_answers
  add column if not exists section_name text;

alter table public.exam_answers
  add column if not exists topic_name text;

alter table public.exam_answers
  add column if not exists question_id uuid references public.questions (public_id) on delete restrict;

alter table public.exam_answers
  add column if not exists question_version integer not null default 1;

alter table public.exam_answers
  add column if not exists question_text text;

alter table public.exam_answers
  add column if not exists explanation text;

alter table public.exam_answers
  add column if not exists selected_choice_id uuid references public.question_choices (id) on delete restrict;

alter table public.exam_answers
  add column if not exists selected_choice_text text;

alter table public.exam_answers
  add column if not exists correct_choice_id uuid references public.question_choices (id) on delete set null;

alter table public.exam_answers
  add column if not exists correct_choice_text text;

alter table public.exam_answers
  add column if not exists is_correct boolean not null default false;

alter table public.exam_answers
  add column if not exists answered_at timestamptz not null default timezone('utc', now());

create index if not exists idx_exam_attempts_user_completed
  on public.exam_attempts (user_id, completed_at desc);

create index if not exists idx_exam_attempts_user_type
  on public.exam_attempts (user_id, exam_type);

create index if not exists idx_exam_attempts_user_section
  on public.exam_attempts (user_id, section_id);

create index if not exists idx_exam_answers_attempt
  on public.exam_answers (exam_attempt_id);

create index if not exists idx_exam_answers_user_answered
  on public.exam_answers (user_id, answered_at desc);

create index if not exists idx_exam_answers_user_section
  on public.exam_answers (user_id, section_id);

create index if not exists idx_exam_answers_user_topic
  on public.exam_answers (user_id, topic_id);

create index if not exists idx_exam_answers_question
  on public.exam_answers (question_id);

create index if not exists idx_exam_answers_attempt_order
  on public.exam_answers (exam_attempt_id, question_order);

alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;

drop policy if exists "Users can read their own exam attempts" on public.exam_attempts;
create policy "Users can read their own exam attempts"
on public.exam_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own exam attempts" on public.exam_attempts;
create policy "Users can insert their own exam attempts"
on public.exam_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own exam attempts" on public.exam_attempts;
create policy "Users can update their own exam attempts"
on public.exam_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own exam answers" on public.exam_answers;
create policy "Users can read their own exam answers"
on public.exam_answers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own exam answers" on public.exam_answers;
create policy "Users can insert their own exam answers"
on public.exam_answers
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own exam answers" on public.exam_answers;
create policy "Users can update their own exam answers"
on public.exam_answers
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
