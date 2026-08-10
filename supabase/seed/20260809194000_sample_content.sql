-- Development-only sample dataset for EPA 608 content browser testing.
-- These records are intentionally labeled as sample questions and are not official EPA exam content.

insert into public.certification_sections (code, name, description, sort_order)
values
  ('CORE', 'Core', 'Sample development content for universal core concepts.', 1),
  ('TYPE_I', 'Type I', 'Sample development content for small appliances.', 2),
  ('TYPE_II', 'Type II', 'Sample development content for high-pressure systems.', 3),
  ('TYPE_III', 'Type III', 'Sample development content for low-pressure systems.', 4)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

with section_refs as (
  select id, code
  from public.certification_sections
),
topic_seed as (
  select *
  from (
    values
      ('CORE_OZONE', 'CORE', 'Ozone Depletion', 'Sample development topic for ozone depletion concepts.', 1),
      ('CORE_SAFETY', 'CORE', 'Safety', 'Sample development topic for safety concepts.', 2),
      ('TYPE1_SMALL_APPLIANCES', 'TYPE_I', 'Small Appliances', 'Sample development topic for Type I systems.', 1),
      ('TYPE1_RECOVERY', 'TYPE_I', 'Recovery Requirements', 'Sample development topic for recovery requirements.', 2),
      ('TYPE2_HIGH_PRESSURE', 'TYPE_II', 'High-Pressure Systems', 'Sample development topic for high-pressure equipment.', 1),
      ('TYPE2_LEAK_REPAIR', 'TYPE_II', 'Leak Repair', 'Sample development topic for leak repair rules.', 2),
      ('TYPE3_LOW_PRESSURE', 'TYPE_III', 'Low-Pressure Systems', 'Sample development topic for low-pressure equipment.', 1),
      ('TYPE3_REFRIGERANTS', 'TYPE_III', 'Refrigerants', 'Sample development topic for refrigerant handling.', 2)
  ) as t(code, section_code, name, description, sort_order)
)
insert into public.topics (section_id, code, name, description, sort_order)
select
  section_refs.id,
  topic_seed.code,
  topic_seed.name,
  topic_seed.description,
  topic_seed.sort_order
from topic_seed
join section_refs
  on section_refs.code = topic_seed.section_code
on conflict (section_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

with section_refs as (
  select id, code
  from public.certification_sections
),
topic_refs as (
  select t.id, t.code, s.code as section_code
  from public.topics t
  join public.certification_sections s
    on s.id = t.section_id
),
question_seed as (
  select *
  from (
    values
      ('11111111-1111-4111-8111-111111111111', 'CORE', 'CORE_OZONE', 'Sample Question: Which layer of the atmosphere is primarily protected by ozone?', 'The ozone layer in the stratosphere protects the earth from ultraviolet radiation. This is sample development content, not official EPA exam language.', 'easy', 'EPA 608 sample reference - Core', 1, true),
      ('11111111-1111-4111-8111-222222222222', 'CORE', 'CORE_SAFETY', 'Sample Question: Which practice best supports safe refrigerant handling?', 'Using the correct protective equipment and following safe handling procedures is the sample development answer here.', 'medium', 'EPA 608 sample reference - Core Safety', 1, true),
      ('22222222-2222-4222-8222-222222222222', 'TYPE_I', 'TYPE1_SMALL_APPLIANCES', 'Sample Question: Which equipment category is most associated with Type I certification?', 'Type I certification focuses on small appliances. This sample question exists only for development and testing.', 'easy', 'EPA 608 sample reference - Type I', 1, true),
      ('22222222-2222-4222-8222-333333333333', 'TYPE_I', 'TYPE1_SMALL_APPLIANCES', 'Sample Question: Which statement best matches Type I recovery work?', 'Type I sample content covers recovery procedures for small appliances in this development dataset.', 'medium', 'EPA 608 sample reference - Type I Recovery', 1, true),
      ('33333333-3333-4333-8333-333333333333', 'TYPE_II', 'TYPE2_HIGH_PRESSURE', 'Sample Question: Type II certification applies most directly to which class of equipment?', 'Type II covers high-pressure and very high-pressure appliances in this sample dataset.', 'medium', 'EPA 608 sample reference - Type II', 1, true),
      ('33333333-3333-4333-8333-444444444444', 'TYPE_II', 'TYPE2_LEAK_REPAIR', 'Sample Question: Which maintenance area is commonly associated with Type II rules?', 'Leak repair is one of the sample content areas associated with Type II in this development dataset.', 'hard', 'EPA 608 sample reference - Type II Leak Repair', 1, true),
      ('44444444-4444-4444-8444-444444444444', 'TYPE_III', 'TYPE3_LOW_PRESSURE', 'Sample Question: Type III certification is used for which appliance pressure category?', 'Type III focuses on low-pressure appliances. This record is sample content only.', 'medium', 'EPA 608 sample reference - Type III', 1, true)
  ) as q(public_id, section_code, topic_code, question_text, explanation, difficulty, reference, version, is_active)
)
insert into public.questions (
  public_id,
  section_id,
  topic_id,
  question_text,
  explanation,
  difficulty,
  reference,
  version,
  is_active
)
select
  question_seed.public_id::uuid,
  section_refs.id,
  topic_refs.id,
  question_seed.question_text,
  question_seed.explanation,
  question_seed.difficulty,
  question_seed.reference,
  question_seed.version,
  question_seed.is_active
from question_seed
join section_refs
  on section_refs.code = question_seed.section_code
left join topic_refs
  on topic_refs.code = question_seed.topic_code
 and topic_refs.section_code = question_seed.section_code
on conflict (public_id) do update
set
  section_id = excluded.section_id,
  topic_id = excluded.topic_id,
  question_text = excluded.question_text,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  reference = excluded.reference,
  version = excluded.version,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

with choice_seed as (
  select *
  from (
    values
      ('11111111-aaaa-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Troposphere', false, 1),
      ('11111111-bbbb-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Stratosphere', true, 2),
      ('11111111-cccc-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Mesosphere', false, 3),
      ('11111111-dddd-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Thermosphere', false, 4),

      ('11111111-eeee-4111-8111-222222222222', '11111111-1111-4111-8111-222222222222', 'Wear appropriate safety equipment', true, 1),
      ('11111111-ffff-4111-8111-222222222222', '11111111-1111-4111-8111-222222222222', 'Vent refrigerant to save time', false, 2),
      ('11111111-9999-4111-8111-222222222222', '11111111-1111-4111-8111-222222222222', 'Ignore cylinder temperature ratings', false, 3),
      ('11111111-8888-4111-8111-222222222222', '11111111-1111-4111-8111-222222222222', 'Use any hose regardless of pressure rating', false, 4),

      ('22222222-aaaa-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Household refrigerators and window A/C units', true, 1),
      ('22222222-bbbb-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Low-pressure chillers', false, 2),
      ('22222222-cccc-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Large commercial cooling towers', false, 3),
      ('22222222-dddd-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Industrial process boilers', false, 4),

      ('22222222-eeee-4222-8222-333333333333', '22222222-2222-4222-8222-333333333333', 'Small appliance recovery procedures', true, 1),
      ('22222222-ffff-4222-8222-333333333333', '22222222-2222-4222-8222-333333333333', 'Centrifugal chiller teardown', false, 2),
      ('22222222-9999-4222-8222-333333333333', '22222222-2222-4222-8222-333333333333', 'Residential furnace combustion tuning', false, 3),
      ('22222222-8888-4222-8222-333333333333', '22222222-2222-4222-8222-333333333333', 'Steam boiler water treatment', false, 4),

      ('33333333-aaaa-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Small hermetic appliances', false, 1),
      ('33333333-bbbb-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'High-pressure and very high-pressure appliances', true, 2),
      ('33333333-cccc-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Low-pressure centrifugal chillers only', false, 3),
      ('33333333-dddd-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Residential gas furnaces', false, 4),

      ('33333333-eeee-4333-8333-444444444444', '33333333-3333-4333-8333-444444444444', 'Leak repair compliance activities', true, 1),
      ('33333333-ffff-4333-8333-444444444444', '33333333-3333-4333-8333-444444444444', 'Window screen replacement', false, 2),
      ('33333333-9999-4333-8333-444444444444', '33333333-3333-4333-8333-444444444444', 'Paint booth filter cleaning', false, 3),
      ('33333333-8888-4333-8333-444444444444', '33333333-3333-4333-8333-444444444444', 'Groundwater pH adjustment', false, 4),

      ('44444444-aaaa-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Very high-pressure transport refrigeration', false, 1),
      ('44444444-bbbb-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Low-pressure appliances', true, 2),
      ('44444444-cccc-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Small appliances under five pounds', false, 3),
      ('44444444-dddd-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Non-refrigeration compressed gas systems', false, 4)
  ) as c(id, question_public_id, choice_text, is_correct, sort_order)
)
insert into public.question_choices (id, question_id, choice_text, is_correct, sort_order)
select
  choice_seed.id::uuid,
  questions.id,
  choice_seed.choice_text,
  choice_seed.is_correct,
  choice_seed.sort_order
from choice_seed
join public.questions
  on public.questions.public_id = choice_seed.question_public_id::uuid
on conflict (id) do update
set
  question_id = excluded.question_id,
  choice_text = excluded.choice_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());
