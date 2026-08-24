import { readFileSync, writeFileSync } from 'node:fs';

const inputPath = new URL('../supabase/seed/epa_custom.sql', import.meta.url);
const outputPath = new URL(
  '../supabase/migrations/20260810210000_import_epa_custom_questions.sql',
  import.meta.url,
);

const parseCsv = (source) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('CSV ends inside a quoted field.');
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
};

const rows = parseCsv(readFileSync(inputPath, 'utf8'));
const header = rows.shift();
const expectedHeader = [
  'section', 'question', 'option_a', 'option_b', 'option_c', 'option_d',
  'correct_answer', 'explanation', 'source_ref',
];
if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
  throw new Error(`Unexpected CSV header: ${JSON.stringify(header)}`);
}

const allowedSections = new Set(['Core', 'TypeI', 'TypeII', 'TypeIII']);
const allowedAnswers = new Set(['A', 'B', 'C', 'D']);
const questions = rows.map((values, index) => {
  if (values.length !== expectedHeader.length) {
    throw new Error(`Row ${index + 2} has ${values.length} fields; expected 9.`);
  }
  const record = Object.fromEntries(expectedHeader.map((key, position) => [key, values[position].trim()]));
  if (!allowedSections.has(record.section)) throw new Error(`Row ${index + 2}: invalid section.`);
  if (!allowedAnswers.has(record.correct_answer)) throw new Error(`Row ${index + 2}: invalid answer.`);
  if (!record.question || !record.explanation || !record.source_ref) {
    throw new Error(`Row ${index + 2}: question, explanation, and source are required.`);
  }
  if ([record.option_a, record.option_b, record.option_c, record.option_d].some((option) => !option)) {
    throw new Error(`Row ${index + 2}: all four options are required.`);
  }
  return record;
});

const counts = questions.reduce((result, question) => {
  result[question.section] = (result[question.section] ?? 0) + 1;
  return result;
}, {});

const payload = JSON.stringify(questions).replace(/\$/g, '\\u0024');
const sql = `-- Generated from supabase/seed/epa_custom.sql (CSV content).
-- Re-run npm run questions:custom-migration after editing the source file.
begin;

create temporary table epa_custom_seed on commit drop as
select *
from jsonb_to_recordset($epa_custom$${payload}$epa_custom$::jsonb) as item(
  section text,
  question text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  explanation text,
  source_ref text
);

with normalized as (
  select
    case section
      when 'Core' then 'CORE'
      when 'TypeI' then 'TYPE_I'
      when 'TypeII' then 'TYPE_II'
      when 'TypeIII' then 'TYPE_III'
    end as section_code,
    question,
    explanation,
    source_ref
  from epa_custom_seed
)
insert into public.questions (
  public_id, section_id, topic_id, question_text, explanation,
  difficulty, reference, version, is_active
)
select
  md5('epa_custom:' || normalized.section_code || ':' || normalized.question)::uuid,
  sections.id,
  null,
  normalized.question,
  normalized.explanation,
  'medium',
  normalized.source_ref,
  1,
  true
from normalized
join public.certification_sections sections on sections.code = normalized.section_code
on conflict (public_id) do update set
  section_id = excluded.section_id,
  topic_id = excluded.topic_id,
  question_text = excluded.question_text,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  reference = excluded.reference,
  version = excluded.version,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

with normalized as (
  select
    case seed.section
      when 'Core' then 'CORE'
      when 'TypeI' then 'TYPE_I'
      when 'TypeII' then 'TYPE_II'
      when 'TypeIII' then 'TYPE_III'
    end as section_code,
    seed.question,
    seed.correct_answer,
    choice.letter,
    choice.choice_text,
    choice.sort_order
  from epa_custom_seed seed
  cross join lateral (
    values
      ('A', seed.option_a, 1),
      ('B', seed.option_b, 2),
      ('C', seed.option_c, 3),
      ('D', seed.option_d, 4)
  ) as choice(letter, choice_text, sort_order)
)
insert into public.question_choices (id, question_id, choice_text, is_correct, sort_order)
select
  md5('epa_custom_choice:' || normalized.section_code || ':' || normalized.question || ':' || normalized.letter)::uuid,
  questions.id,
  normalized.choice_text,
  normalized.letter = normalized.correct_answer,
  normalized.sort_order
from normalized
join public.questions questions
  on questions.public_id = md5('epa_custom:' || normalized.section_code || ':' || normalized.question)::uuid
on conflict (id) do update set
  question_id = excluded.question_id,
  choice_text = excluded.choice_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

commit;
`;

writeFileSync(outputPath, sql);
console.log(JSON.stringify({ total: questions.length, sections: counts, output: outputPath.pathname }));
