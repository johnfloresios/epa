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
  with answer_history as (
    select
      practice_answers.section_id,
      practice_answers.section_code,
      practice_answers.section_name,
      practice_answers.is_correct
    from public.practice_answers
    where practice_answers.user_id = auth.uid()

    union all

    select
      exam_answers.section_id,
      exam_answers.section_code,
      exam_answers.section_name,
      exam_answers.is_correct
    from public.exam_answers
    join public.exam_attempts
      on exam_attempts.id = exam_answers.exam_attempt_id
    where exam_answers.user_id = auth.uid()
      and exam_attempts.completed_at is not null
  )
  select
    answer_history.section_id,
    coalesce(answer_history.section_code, certification_sections.code) as section_code,
    coalesce(answer_history.section_name, certification_sections.name) as section_name,
    count(*) as answered_count,
    count(*) filter (where answer_history.is_correct) as correct_count,
    count(*) filter (where not answer_history.is_correct) as incorrect_count,
    coalesce(
      (count(*) filter (where answer_history.is_correct))::double precision / nullif(count(*), 0),
      0
    ) as accuracy
  from answer_history
  left join public.certification_sections
    on certification_sections.id = answer_history.section_id
  group by answer_history.section_id, answer_history.section_code, answer_history.section_name, certification_sections.code, certification_sections.name
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
  with answer_history as (
    select
      practice_answers.section_id,
      practice_answers.section_code,
      practice_answers.section_name,
      practice_answers.topic_id,
      practice_answers.topic_name,
      practice_answers.is_correct
    from public.practice_answers
    where practice_answers.user_id = auth.uid()

    union all

    select
      exam_answers.section_id,
      exam_answers.section_code,
      exam_answers.section_name,
      exam_answers.topic_id,
      exam_answers.topic_name,
      exam_answers.is_correct
    from public.exam_answers
    join public.exam_attempts
      on exam_attempts.id = exam_answers.exam_attempt_id
    where exam_answers.user_id = auth.uid()
      and exam_attempts.completed_at is not null
  )
  select
    answer_history.section_id,
    coalesce(answer_history.section_code, certification_sections.code) as section_code,
    coalesce(answer_history.section_name, certification_sections.name) as section_name,
    answer_history.topic_id,
    coalesce(answer_history.topic_name, topics.name, 'Unknown Topic') as topic_name,
    count(*) as answered_count,
    count(*) filter (where answer_history.is_correct) as correct_count,
    count(*) filter (where not answer_history.is_correct) as incorrect_count,
    coalesce(
      (count(*) filter (where answer_history.is_correct))::double precision / nullif(count(*), 0),
      0
    ) as accuracy
  from answer_history
  left join public.certification_sections
    on certification_sections.id = answer_history.section_id
  left join public.topics
    on topics.id = answer_history.topic_id
  where answer_history.topic_id is not null
  group by
    answer_history.section_id,
    answer_history.section_code,
    answer_history.section_name,
    certification_sections.code,
    certification_sections.name,
    answer_history.topic_id,
    answer_history.topic_name,
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
  with answer_history as (
    select
      practice_answers.id,
      practice_answers.question_id,
      practice_answers.section_id,
      practice_answers.section_code,
      practice_answers.section_name,
      practice_answers.topic_id,
      practice_answers.topic_name,
      practice_answers.question_text,
      practice_answers.question_version,
      practice_answers.is_correct,
      practice_answers.answered_at
    from public.practice_answers
    where practice_answers.user_id = auth.uid()

    union all

    select
      exam_answers.id,
      exam_answers.question_id,
      exam_answers.section_id,
      exam_answers.section_code,
      exam_answers.section_name,
      exam_answers.topic_id,
      exam_answers.topic_name,
      exam_answers.question_text,
      exam_answers.question_version,
      exam_answers.is_correct,
      exam_answers.answered_at
    from public.exam_answers
    join public.exam_attempts
      on exam_attempts.id = exam_answers.exam_attempt_id
    where exam_answers.user_id = auth.uid()
      and exam_attempts.completed_at is not null
  ),
  aggregated as (
    select
      answer_history.question_id,
      count(*) as attempts_count,
      count(*) filter (where not answer_history.is_correct) as incorrect_count,
      max(answer_history.answered_at) as last_attempted
    from answer_history
    group by answer_history.question_id
    having count(*) filter (where not answer_history.is_correct) > 0
  ),
  latest as (
    select distinct on (answer_history.question_id)
      answer_history.question_id,
      answer_history.section_id,
      answer_history.section_code,
      answer_history.section_name,
      answer_history.topic_id,
      answer_history.topic_name,
      answer_history.question_text,
      answer_history.id as latest_answer_id,
      answer_history.question_version as latest_question_version
    from answer_history
    order by answer_history.question_id, answer_history.answered_at desc, answer_history.id desc
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
    answer_history.answer_id,
    answer_history.session_id,
    answer_history.question_order,
    answer_history.section_code,
    answer_history.section_name,
    answer_history.topic_name,
    answer_history.question_text,
    answer_history.selected_choice_text,
    answer_history.correct_choice_text,
    answer_history.is_correct,
    answer_history.question_version,
    answer_history.explanation,
    answer_history.answered_at
  from (
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
      practice_answers.answered_at,
      practice_answers.question_id
    from public.practice_answers
    where practice_answers.user_id = auth.uid()

    union all

    select
      exam_answers.id as answer_id,
      exam_answers.exam_attempt_id as session_id,
      exam_answers.question_order,
      exam_answers.section_code,
      exam_answers.section_name,
      exam_answers.topic_name,
      exam_answers.question_text,
      exam_answers.selected_choice_text,
      exam_answers.correct_choice_text,
      exam_answers.is_correct,
      exam_answers.question_version,
      exam_answers.explanation,
      exam_answers.answered_at,
      exam_answers.question_id
    from public.exam_answers
    join public.exam_attempts
      on exam_attempts.id = exam_answers.exam_attempt_id
    where exam_answers.user_id = auth.uid()
      and exam_attempts.completed_at is not null
  ) as answer_history
  where answer_history.question_id = question_public_id
  order by answer_history.answered_at desc, answer_history.answer_id desc;
$$;

grant execute on function public.get_question_attempt_history(uuid) to authenticated;
