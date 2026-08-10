alter table public.practice_answers
  add column if not exists question_order integer not null default 1;

alter table public.practice_answers
  add column if not exists section_code text;

alter table public.practice_answers
  add column if not exists section_name text;

alter table public.practice_answers
  add column if not exists topic_name text;

alter table public.practice_answers
  add column if not exists question_text text;

alter table public.practice_answers
  add column if not exists explanation text;

alter table public.practice_answers
  add column if not exists selected_choice_text text;

alter table public.practice_answers
  add column if not exists correct_choice_id uuid references public.question_choices (id) on delete set null;

alter table public.practice_answers
  add column if not exists correct_choice_text text;

create index if not exists idx_practice_answers_session_order
  on public.practice_answers (session_id, question_order);

with ranked_answers as (
  select
    id,
    row_number() over (
      partition by session_id
      order by answered_at asc, id asc
    ) as row_num
  from public.practice_answers
)
update public.practice_answers as practice_answers
set question_order = ranked_answers.row_num
from ranked_answers
where ranked_answers.id = practice_answers.id;

with answer_snapshot as (
  select
    practice_answers.id,
    certification_sections.code as section_code,
    certification_sections.name as section_name,
    topics.name as topic_name,
    questions.question_text,
    questions.explanation,
    selected_choice.choice_text as selected_choice_text,
    correct_choice.id as correct_choice_id,
    correct_choice.choice_text as correct_choice_text
  from public.practice_answers
  join public.questions
    on questions.public_id = practice_answers.question_id
  join public.certification_sections
    on certification_sections.id = questions.section_id
  left join public.topics
    on topics.id = questions.topic_id
  left join public.question_choices as selected_choice
    on selected_choice.id = practice_answers.selected_choice_id
  left join public.question_choices as correct_choice
    on correct_choice.question_id = questions.id
   and correct_choice.is_correct = true
)
update public.practice_answers
set
  section_code = coalesce(practice_answers.section_code, answer_snapshot.section_code),
  section_name = coalesce(practice_answers.section_name, answer_snapshot.section_name),
  topic_name = coalesce(practice_answers.topic_name, answer_snapshot.topic_name),
  question_text = coalesce(practice_answers.question_text, answer_snapshot.question_text),
  explanation = coalesce(practice_answers.explanation, answer_snapshot.explanation),
  selected_choice_text = coalesce(practice_answers.selected_choice_text, answer_snapshot.selected_choice_text),
  correct_choice_id = coalesce(practice_answers.correct_choice_id, answer_snapshot.correct_choice_id),
  correct_choice_text = coalesce(practice_answers.correct_choice_text, answer_snapshot.correct_choice_text)
from answer_snapshot
where answer_snapshot.id = practice_answers.id;
