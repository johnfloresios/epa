create or replace function public.get_section_performance()
returns table (
  section_id uuid,
  section_code text,
  section_name text,
  answered_count bigint,
  correct_count bigint,
  incorrect_count bigint,
  accuracy double precision
)
language sql
stable
set search_path = public
as $$
  select
    practice_answers.section_id,
    coalesce(practice_answers.section_code, certification_sections.code) as section_code,
    coalesce(practice_answers.section_name, certification_sections.name) as section_name,
    count(*) as answered_count,
    count(*) filter (where practice_answers.is_correct) as correct_count,
    count(*) filter (where not practice_answers.is_correct) as incorrect_count,
    coalesce(
      (count(*) filter (where practice_answers.is_correct))::double precision / nullif(count(*), 0),
      0
    ) as accuracy
  from public.practice_answers
  left join public.certification_sections
    on certification_sections.id = practice_answers.section_id
  where practice_answers.user_id = auth.uid()
  group by practice_answers.section_id, practice_answers.section_code, practice_answers.section_name, certification_sections.code, certification_sections.name
  order by accuracy asc, answered_count desc, section_name asc;
$$;

grant execute on function public.get_section_performance() to authenticated;

create or replace function public.get_topic_performance()
returns table (
  section_id uuid,
  section_code text,
  section_name text,
  topic_id uuid,
  topic_name text,
  answered_count bigint,
  correct_count bigint,
  incorrect_count bigint,
  accuracy double precision
)
language sql
stable
set search_path = public
as $$
  select
    practice_answers.section_id,
    coalesce(practice_answers.section_code, certification_sections.code) as section_code,
    coalesce(practice_answers.section_name, certification_sections.name) as section_name,
    practice_answers.topic_id,
    coalesce(practice_answers.topic_name, topics.name, 'Unknown Topic') as topic_name,
    count(*) as answered_count,
    count(*) filter (where practice_answers.is_correct) as correct_count,
    count(*) filter (where not practice_answers.is_correct) as incorrect_count,
    coalesce(
      (count(*) filter (where practice_answers.is_correct))::double precision / nullif(count(*), 0),
      0
    ) as accuracy
  from public.practice_answers
  left join public.certification_sections
    on certification_sections.id = practice_answers.section_id
  left join public.topics
    on topics.id = practice_answers.topic_id
  where practice_answers.user_id = auth.uid()
    and practice_answers.topic_id is not null
  group by
    practice_answers.section_id,
    practice_answers.section_code,
    practice_answers.section_name,
    certification_sections.code,
    certification_sections.name,
    practice_answers.topic_id,
    practice_answers.topic_name,
    topics.name
  order by accuracy asc, answered_count desc, topic_name asc;
$$;

grant execute on function public.get_topic_performance() to authenticated;

create or replace function public.get_missed_questions(limit_count integer default 100)
returns table (
  question_id uuid,
  section_id uuid,
  section_code text,
  section_name text,
  topic_id uuid,
  topic_name text,
  question_text text,
  attempts_count bigint,
  incorrect_count bigint,
  last_attempted timestamptz,
  latest_answer_id uuid,
  latest_question_version integer
)
language sql
stable
set search_path = public
as $$
  with aggregated as (
    select
      practice_answers.question_id,
      count(*) as attempts_count,
      count(*) filter (where not practice_answers.is_correct) as incorrect_count,
      max(practice_answers.answered_at) as last_attempted
    from public.practice_answers
    where practice_answers.user_id = auth.uid()
    group by practice_answers.question_id
    having count(*) filter (where not practice_answers.is_correct) > 0
  ),
  latest as (
    select distinct on (practice_answers.question_id)
      practice_answers.question_id,
      practice_answers.section_id,
      practice_answers.section_code,
      practice_answers.section_name,
      practice_answers.topic_id,
      practice_answers.topic_name,
      practice_answers.question_text,
      practice_answers.id as latest_answer_id,
      practice_answers.question_version as latest_question_version
    from public.practice_answers
    where practice_answers.user_id = auth.uid()
    order by practice_answers.question_id, practice_answers.answered_at desc, practice_answers.id desc
  )
  select
    aggregated.question_id,
    latest.section_id,
    latest.section_code,
    latest.section_name,
    latest.topic_id,
    latest.topic_name,
    latest.question_text,
    aggregated.attempts_count,
    aggregated.incorrect_count,
    aggregated.last_attempted,
    latest.latest_answer_id,
    latest.latest_question_version
  from aggregated
  join latest
    on latest.question_id = aggregated.question_id
  order by aggregated.incorrect_count desc, aggregated.last_attempted desc
  limit greatest(limit_count, 1);
$$;

grant execute on function public.get_missed_questions(integer) to authenticated;

create or replace function public.get_question_attempt_history(question_public_id uuid)
returns table (
  answer_id uuid,
  session_id uuid,
  question_order integer,
  section_code text,
  section_name text,
  topic_name text,
  question_text text,
  selected_choice_text text,
  correct_choice_text text,
  is_correct boolean,
  question_version integer,
  explanation text,
  answered_at timestamptz
)
language sql
stable
set search_path = public
as $$
  select
    practice_answers.id as answer_id,
    practice_answers.session_id,
    practice_answers.question_order,
    practice_answers.section_code,
    practice_answers.section_name,
    practice_answers.topic_name,
    practice_answers.question_text,
    practice_answers.selected_choice_text,
    practice_answers.correct_choice_text,
    practice_answers.is_correct,
    practice_answers.question_version,
    practice_answers.explanation,
    practice_answers.answered_at
  from public.practice_answers
  where practice_answers.user_id = auth.uid()
    and practice_answers.question_id = question_public_id
  order by practice_answers.answered_at desc, practice_answers.id desc;
$$;

grant execute on function public.get_question_attempt_history(uuid) to authenticated;
