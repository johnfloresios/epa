-- Original EPA Section 608 practice content derived from the EPA resources cited
-- in each record. These are not official exam questions and are not endorsed by EPA.
-- Fifteen source facts per section are rendered as seven distinct question prompts,
-- producing 105 active questions per section (420 total).

with epa608_facts (
  section_code, topic_code, fact_key, subject, correct_answer,
  distractor_1, distractor_2, distractor_3, explanation, reference_url
) as (
  values
  ('CORE','CORE_OZONE','c01','how chlorine affects stratospheric ozone','Chlorine released from CFCs and HCFCs can destroy stratospheric ozone','Chlorine creates ozone in the troposphere','Chlorine has no atmospheric effect','Chlorine only affects indoor air','Strong UV light can break down CFCs in the stratosphere and release ozone-depleting chlorine.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_OZONE','c02','the refrigerant class of R-12','R-12 is a CFC refrigerant','R-12 is an HCFC refrigerant','R-12 is an HFC refrigerant','R-12 is a hydrocarbon refrigerant','EPA test topics identify R-12 as a CFC.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_OZONE','c03','the refrigerant class of R-22','R-22 is an HCFC refrigerant','R-22 is a CFC refrigerant','R-22 is an HFC refrigerant','R-22 is an ammonia refrigerant','EPA test topics identify R-22 as an HCFC.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_OZONE','c04','the refrigerant class of R-134a','R-134a is an HFC refrigerant','R-134a is a CFC refrigerant','R-134a is an HCFC refrigerant','R-134a is sulfur dioxide','EPA test topics identify R-134a as an HFC.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_OZONE','c05','the ozone-depletion potential of HFCs','HFCs have zero ozone-depletion potential because they contain no chlorine or bromine','HFCs have the highest ozone-depletion potential','All HFCs have the same ozone-depletion potential as CFC-11','HFC ozone-depletion potential depends only on cylinder color','HFCs do not contain chlorine or bromine and have zero ODP, though some have high global-warming potential.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_OZONE','c06','the Montreal Protocol','It is an international agreement controlling the phaseout of ozone-depleting substances','It is a U.S. electrical wiring code','It establishes refrigerant cylinder colors','It licenses individual HVAC contractors','The Montreal Protocol is the international agreement addressing production and use of ozone-depleting substances.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_SAFETY','c07','the Section 608 venting prohibition','Intentional venting of covered refrigerants and substitutes during service or disposal is prohibited','Venting is always allowed outdoors','Only liquid refrigerant is covered','Venting is required before every repair','Section 608 generally prohibits intentional venting during maintenance, service, repair, and disposal.','https://www.epa.gov/section608/stationary-refrigeration-prohibition-venting-refrigerants'),
  ('CORE','CORE_SAFETY','c08','a permitted de minimis release','A small release while making a good-faith effort to recover refrigerant can be permitted','Emptying a full cylinder to save storage space is permitted','Venting an appliance before disposal is permitted','Releasing refrigerant to speed a repair is permitted','EPA permits de minimis releases associated with good-faith recovery and recycling efforts.','https://www.epa.gov/section608/stationary-refrigeration-prohibition-venting-refrigerants'),
  ('CORE','CORE_SAFETY','c09','the meaning of recover','Remove refrigerant from an appliance and store it externally without necessarily processing it','Clean refrigerant to AHRI 700 purity','Destroy refrigerant by combustion','Add refrigerant to a charged appliance','EPA defines recovery as removal and external storage without necessarily testing or processing.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('CORE','CORE_SAFETY','c10','the meaning of recycle','Extract and clean refrigerant for reuse by the same owner without meeting reclamation standards','Release refrigerant after filtering','Process refrigerant only at the original manufacturer','Convert refrigerant into a different chemical','Recycling cleans recovered refrigerant, commonly through oil separation and filter-driers, for reuse by the same owner.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('CORE','CORE_SAFETY','c11','the meaning of reclaim','Reprocess refrigerant to AHRI Standard 700 purity and verify it analytically','Store refrigerant without testing it','Run refrigerant through one filter-drier on site','Return refrigerant to the same appliance unchanged','Reclamation restores refrigerant to the specified purity and requires analytical verification.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('CORE','CORE_SAFETY','c12','refrigerant that changes ownership','Recovered refrigerant must be reclaimed by an EPA-certified reclaimer before changing ownership','Recovered refrigerant must always be destroyed','Recovered refrigerant may be sold without processing','Recovered refrigerant must be mixed with virgin refrigerant','EPA requires reclamation when recovered refrigerant changes ownership.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('CORE','CORE_SAFETY','c13','safe nitrogen use for leak testing','Use nitrogen with a pressure regulator and relief valve','Use oxygen without a regulator','Use compressed air mixed with refrigerant','Heat a disposable cylinder to raise test pressure','EPA test topics specify nitrogen rather than oxygen or compressed air, with a regulator and relief valve.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_SAFETY','c14','filling a recovery cylinder','Do not fill a recovery cylinder beyond 80 percent of its capacity','Always fill a cylinder completely with liquid','Fill disposable cylinders to 90 percent','Cylinder fill limits apply only in winter','Limiting fill to 80 percent leaves room for liquid expansion and is an EPA test safety topic.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('CORE','CORE_SAFETY','c15','reusable and disposable refrigerant cylinders','Use a DOT-approved recovery cylinder and never refill a disposable cylinder','Refill any disposable cylinder if it looks undamaged','Recovery cylinders do not need DOT approval','Mix refrigerants in one cylinder to save space','EPA test topics distinguish DOT-approved reusable recovery cylinders from disposable cylinders that must not be refilled.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),

  ('TYPE_I','TYPE1_SMALL_APPLIANCES','i01','the EPA definition of a small appliance','A factory-made, factory-charged, hermetically sealed appliance containing five pounds or less of refrigerant','Any appliance weighing less than five pounds','Any field-charged split system','Every residential central air conditioner','EPA defines small appliances by factory manufacture, factory charge, hermetic sealing, and a charge of five pounds or less.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('TYPE_I','TYPE1_SMALL_APPLIANCES','i02','an example of a small appliance','A household refrigerator can qualify as a small appliance','A large centrifugal chiller is a small appliance','A supermarket rack is a small appliance','An industrial process refrigeration system is a small appliance','Household refrigerators are among the products listed in EPA’s small-appliance definition.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('TYPE_I','TYPE1_SMALL_APPLIANCES','i03','room air conditioners under Type I','A factory-sealed room air conditioner with five pounds or less can be a small appliance','Every rooftop unit is a small appliance','Only automobile air conditioners are small appliances','Room air conditioners are excluded from Section 608','EPA includes room air conditioners, including window units and PTACs, in the small-appliance definition when other criteria are met.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('TYPE_I','TYPE1_SMALL_APPLIANCES','i04','other products that can be small appliances','Dehumidifiers, vending machines, and drinking-water coolers can qualify','Cooling towers qualify regardless of charge','Boilers qualify if factory assembled','Open-drive industrial chillers always qualify','EPA’s definition lists dehumidifiers, vending machines, and drinking-water coolers among qualifying products.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('TYPE_I','TYPE1_RECOVERY','i05','small-appliance recovery with a working compressor and post-1993 equipment','Recover 90 percent of the refrigerant','Recover 50 percent of the refrigerant','Recover 80 percent in every case','No recovery is required','EPA requires 90 percent recovery when post-November 15, 1993 equipment is used and the compressor operates.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_I','TYPE1_RECOVERY','i06','small-appliance recovery with an inoperative compressor','Recover 80 percent of the refrigerant','Recover 90 percent regardless of equipment','Recover only vapor','Venting is permitted because the compressor failed','EPA requires 80 percent recovery when the appliance compressor is not functional.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_I','TYPE1_RECOVERY','i07','small-appliance recovery using pre-1993 equipment','Recover 80 percent of the refrigerant','Recover 100 percent of the refrigerant','Recover 90 percent only','No recovery percentage applies','EPA requires 80 percent recovery when recovery equipment was manufactured before November 15, 1993.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_I','TYPE1_RECOVERY','i08','the alternate small-appliance evacuation standard','Evacuate the small appliance to four inches of mercury vacuum','Evacuate it to 25 mm Hg absolute','Pressurize it to 10 psig','Evacuate it only to atmospheric pressure','EPA permits the percentage requirement to be satisfied by evacuating a small appliance to four inches Hg vacuum.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_I','TYPE1_RECOVERY','i09','passive recovery with an operating compressor','Run the appliance compressor to help move refrigerant to the recovery container','Disable the compressor before recovery','Vent the high side first','Add oxygen to drive out refrigerant','EPA test topics call for operating a functional compressor during system-dependent recovery.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i10','passive recovery with an inoperative compressor','Install access on both the high and low sides','Use only a low-side access point','Recover only the oil','Heat the disposable cylinder with a torch','EPA test topics specify access to both high and low sides when the compressor is inoperative.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i11','solderless access fittings after service','Remove temporary solderless access fittings when service is complete','Leave every temporary fitting permanently installed','Vent through the fitting before removal','Replace the fitting with a disposable cylinder valve','EPA test topics state that solderless access fittings should be removed at the conclusion of service.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i12','identifying refrigerant in a small appliance','Compare measured pressure and temperature with a pressure-temperature relationship','Identify it only by cylinder color','Assume every household refrigerator uses R-12','Mix a sample with a known refrigerant','Pressure and temperature can help identify refrigerant and reveal noncondensables.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i13','R-134a in small appliances','R-134a was identified as a likely substitute for R-12','R-134a is another name for R-12','R-134a contains chlorine','R-134a may always be mixed with R-12','EPA test topics identify HFC-134a as a likely substitute for CFC-12.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i14','heating refrigerant during small-appliance recovery','Use only controlled, safe warming methods and never an open flame','Use a torch directly on the appliance','Heat a disposable cylinder above its rating','Use oxygen to raise pressure','Refrigerants can form hazardous decomposition products at high temperatures; open-flame heating is unsafe.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_I','TYPE1_RECOVERY','i15','system-dependent recovery equipment','It relies on the appliance or another external pressure source to move refrigerant','It always contains its own compressor','It reclaims refrigerant to AHRI 700','It can be used only on low-pressure chillers','EPA test topics distinguish system-dependent equipment from self-contained recovery equipment.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),

  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii01','equipment covered by Type II certification','High- and very-high-pressure appliances other than small appliances and MVACs','Only low-pressure chillers','Only factory-sealed appliances with five pounds or less','Motor vehicle air conditioners only','EPA defines Type II as servicing or disposing of high- or very-high-pressure appliances, excluding small appliances and MVACs.','https://www.epa.gov/section608/section-608-technician-certification-requirements'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii02','a preferred gas for pressure leak testing','Use regulated nitrogen','Use pure oxygen','Use unregulated compressed air','Use the system refrigerant alone whenever possible','EPA test topics identify nitrogen alone as the preferred pressure test gas.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii03','testing before charging a repaired high-pressure system','Leak test the system before charging or recharging it','Charge fully before looking for leaks','Skip testing if oil is visible','Use oxygen after charging','EPA test topics call for leak testing before charging or recharging.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii04','signs of leakage in a hermetic high-pressure system','Oil traces can indicate the location of a refrigerant leak','Ice on a recovery cylinder proves a system leak','A clean joint always proves a leak','Normal superheat proves a major leak','Oil can escape with refrigerant and leave traces near a leak.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii05','the commercial-refrigeration leak trigger rate','20 percent over a 12-month period','10 percent over a 12-month period','30 percent over a 12-month period','50 percent over a 12-month period','EPA lists a 20 percent trigger rate for covered commercial refrigeration appliances.','https://www.epa.gov/section608/stationary-refrigeration-leak-repair-requirements'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii06','the industrial-process-refrigeration leak trigger rate','30 percent over a 12-month period','10 percent over a 12-month period','20 percent over a 12-month period','40 percent over a 12-month period','EPA lists a 30 percent trigger rate for covered industrial process refrigeration appliances.','https://www.epa.gov/section608/stationary-refrigeration-leak-repair-requirements'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii07','the comfort-cooling leak trigger rate','10 percent over a 12-month period','20 percent over a 12-month period','30 percent over a 12-month period','5 percent over a 12-month period','EPA lists a 10 percent trigger rate for covered comfort-cooling appliances.','https://www.epa.gov/section608/stationary-refrigeration-leak-repair-requirements'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii08','which appliances trigger current Section 608 leak-repair action','Appliances with 50 or more pounds of ozone-depleting refrigerant that exceed the applicable leak rate','Every appliance with any refrigerant loss','Only appliances with less than five pounds','Only appliances using substitute HFC refrigerants','The current EPA overview applies corrective-action requirements to appliances with at least 50 pounds of ODS refrigerant above trigger rates.','https://www.epa.gov/section608/stationary-refrigeration-leak-repair-requirements'),
  ('TYPE_II','TYPE2_LEAK_REPAIR','ii09','the general corrective-action timeline after exceeding a leak trigger','Repair within 30 days or develop a retrofit or retirement plan within 30 days','Wait one year before taking action','Repair within 24 hours in every case','Only report the leak when the appliance is sold','EPA generally requires repair or a retrofit/retirement plan within 30 days.','https://www.epa.gov/section608/stationary-refrigeration-leak-repair-requirements'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii10','recovery from a high-pressure appliance with under 200 pounds using post-1993 equipment','Evacuate to 0 inches Hg vacuum','Evacuate to 10 inches Hg vacuum','Evacuate to 15 inches Hg vacuum','Evacuate to 25 mm Hg absolute','EPA’s current table specifies 0 inches Hg vacuum for high-pressure appliances under 200 pounds.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii11','recovery from a high-pressure appliance with 200 pounds or more using post-1993 equipment','Evacuate to 10 inches Hg vacuum','Evacuate to 0 inches Hg vacuum','Evacuate to 4 inches Hg vacuum','Evacuate to 25 mm Hg absolute','EPA’s current table specifies 10 inches Hg vacuum for this category with post-1993 equipment.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii12','the definition of a major repair','Removal of the compressor, condenser, evaporator, or auxiliary heat-exchanger coil','Replacing external insulation','Painting the appliance cabinet','Tightening mounting bolts','EPA defines major maintenance, service, or repair by removal of listed major components.','https://www.epa.gov/section608/definitions-section-608-terms'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii13','system-dependent recovery on a large charge','Do not use system-dependent equipment on appliances containing more than 15 pounds','Use system-dependent equipment on every charge size','System-dependent equipment is required above 50 pounds','Charge size never affects recovery-equipment choice','EPA test topics prohibit system-dependent recovery equipment on systems containing more than 15 pounds.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii14','speeding refrigerant recovery','Recover liquid first when practical','Recover only vapor from the beginning','Use longer, narrower hoses','Warm the recovery cylinder','EPA test topics note that recovering liquid first speeds the process.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_II','TYPE2_HIGH_PRESSURE','ii15','energizing a hermetic compressor under vacuum','Do not energize it because motor insulation damage can occur','Always energize it to deepen the vacuum','Energize it only with oxygen present','Energizing it is required before leak testing','EPA test safety topics warn against energizing hermetic compressors under vacuum.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),

  ('TYPE_III','TYPE3_LOW_PRESSURE','iii01','equipment covered by Type III certification','Low-pressure appliances','Small appliances only','High-pressure rooftop units only','Motor vehicle air conditioners','EPA defines Type III certification for servicing or disposing of low-pressure appliances.','https://www.epa.gov/section608/section-608-technician-certification-requirements'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii02','the required evacuation level for a low-pressure appliance','25 mm Hg absolute','25 inches Hg vacuum','10 inches Hg vacuum','0 psig only','EPA’s evacuation table specifies 25 mm Hg absolute for low-pressure appliances.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii03','the first preferred way to pressurize a low-pressure system for leak testing','Use controlled hot water or the built-in heating/pressurization device','Use oxygen','Use compressed air','Add liquid refrigerant until pressure is high','EPA test topics prefer controlled hot water or a built-in device before nitrogen.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii04','a sign that air is leaking into a low-pressure system','Excessive purge-unit operation','Low recovery-cylinder weight','A clean oil sample','Reduced condenser-water temperature alone','EPA test topics identify excessive purging as a sign of leakage into the system.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii05','the purpose of a purge unit','Remove noncondensable gases from the system','Add liquid refrigerant to the evaporator','Raise chilled-water temperature','Lubricate the compressor bearings','EPA test topics include the purge unit’s role in removing air and other noncondensables.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii06','recovering from a low-pressure appliance','Recover vapor as well as liquid','Recover liquid only','Vent vapor after liquid recovery','Recover oil but not refrigerant vapor','EPA test topics emphasize that vapor must be recovered in addition to liquid.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii07','water management during low-pressure refrigerant evacuation','Circulate or remove water to prevent freezing','Stop all water flow and leave tubes full','Add salt directly to the refrigerant','Heat the refrigerant with an open flame','Evacuation can lower temperature enough to freeze water, so water must be circulated or removed.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii08','adding refrigerant to a low-pressure chiller','Introduce vapor before liquid to reduce the risk of freezing water in the tubes','Charge liquid first into a deep vacuum','Add oxygen before refrigerant','Charge through the purge-unit exhaust','EPA test topics specify vapor before liquid to prevent tube-water freezing.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii09','where to charge a centrifugal chiller','Use the evaporator charging valve','Use the purge exhaust','Use the condenser-water drain','Use the relief valve','EPA test topics specify charging centrifugal chillers through the evaporator charging valve.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii10','oil removal from a low-pressure chiller','Heat the oil to 130°F before removal to minimize refrigerant release','Cool the oil below freezing','Remove oil at any temperature and vent the vapor','Mix water into the oil before draining','EPA test topics specify heating oil to 130°F before removal to reduce refrigerant release.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii11','opening a low-pressure appliance for a non-major repair','Pressurize the appliance to 0 psig before opening','Evacuate it to 10 inches Hg vacuum','Pressurize it with oxygen','Open it while it remains below atmospheric pressure','EPA requires low-pressure appliances to be brought to 0 psig before qualifying non-major repairs.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii12','a leaking component that cannot reach the normal evacuation level','Evacuate it to the lowest attainable level that does not substantially contaminate recovered refrigerant, not above 0 psig','Vent it completely to the atmosphere','Pressurize it with oxygen','Ignore the non-leaking portions of the appliance','EPA provides a limited procedure for leaking equipment that cannot attain the prescribed evacuation level.','https://www.epa.gov/section608/stationary-refrigeration-service-practice-requirements'),
  ('TYPE_III','TYPE3_LOW_PRESSURE','iii13','checking recovery after reaching the target vacuum','Wait a few minutes and watch for a pressure rise','Immediately open the system','Add liquid refrigerant immediately','Vent until the pressure cannot rise','A pressure rise can indicate refrigerant remaining in liquid or oil.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_REFRIGERANTS','iii14','the pressure-temperature relationship in a low-pressure chiller','System pressure changes predictably with refrigerant saturation temperature','Pressure and temperature are unrelated','Only ambient humidity determines refrigerant pressure','Cylinder color determines system pressure','EPA test topics include pressure-temperature relationships for low-pressure refrigerants.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html'),
  ('TYPE_III','TYPE3_REFRIGERANTS','iii15','equipment-room protection for low-pressure refrigerants','Use required refrigerant and oxygen-deprivation detection appropriate to the equipment room','Rely only on odor to detect refrigerant','Disable alarms during service','Use an oxygen cylinder as a leak detector','EPA test topics include refrigerant sensing for R-123 and oxygen-deprivation protection under ASHRAE Standard 15.','https://19january2021snapshot.epa.gov/section608/section-608-technician-certification-test-topics_.html')
), prompt_variants(variant, prompt) as (
  values
    (1, 'Which statement is correct about %s?'),
    (2, 'For EPA Section 608 purposes, which answer best describes %s?'),
    (3, 'A technician is reviewing %s. Which statement should the technician apply?'),
    (4, 'Select the accurate statement concerning %s.'),
    (5, 'Which option correctly explains %s?'),
    (6, 'During Section 608 preparation, what should be remembered about %s?'),
    (7, 'Which answer is consistent with EPA guidance on %s?')
), generated_questions as (
  select
    md5('epa608-question-bank-v1:' || fact_key || ':' || variant)::uuid as public_id,
    section_code,
    topic_code,
    fact_key,
    variant,
    format(prompt, subject) as question_text,
    explanation,
    reference_url,
    case when variant in (1, 2) then 'easy' when variant in (3, 4, 5) then 'medium' else 'hard' end as difficulty
  from epa608_facts
  cross join prompt_variants
), section_refs as (
  select id, code from public.certification_sections
), topic_refs as (
  select topics.id, topics.code, certification_sections.code as section_code
  from public.topics
  join public.certification_sections on certification_sections.id = topics.section_id
), upserted_questions as (
insert into public.questions (
  public_id, section_id, topic_id, question_text, explanation,
  difficulty, reference, version, is_active
)
select
  generated_questions.public_id,
  section_refs.id,
  topic_refs.id,
  generated_questions.question_text,
  generated_questions.explanation,
  generated_questions.difficulty,
  generated_questions.reference_url,
  1,
  true
from generated_questions
join section_refs on section_refs.code = generated_questions.section_code
join topic_refs
  on topic_refs.code = generated_questions.topic_code
 and topic_refs.section_code = generated_questions.section_code
on conflict (public_id) do update set
  section_id = excluded.section_id,
  topic_id = excluded.topic_id,
  question_text = excluded.question_text,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  reference = excluded.reference,
  version = excluded.version,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now())
returning id, public_id
), generated_choices as (
  select
    md5('epa608-question-bank-v1:' || facts.fact_key || ':' || variants.variant)::uuid as question_public_id,
    choices.choice_order,
    choices.choice_text,
    choices.is_correct
  from epa608_facts facts
  cross join prompt_variants variants
  cross join lateral (
    values
      (1, facts.correct_answer, true),
      (2, facts.distractor_1, false),
      (3, facts.distractor_2, false),
      (4, facts.distractor_3, false)
  ) as choices(choice_order, choice_text, is_correct)
)
insert into public.question_choices (id, question_id, choice_text, is_correct, sort_order)
select
  md5('epa608-choice-bank-v1:' || generated_choices.question_public_id::text || ':' || generated_choices.choice_order)::uuid,
  questions.id,
  generated_choices.choice_text,
  generated_choices.is_correct,
  generated_choices.choice_order
from generated_choices
join upserted_questions questions on questions.public_id = generated_choices.question_public_id
on conflict (id) do update set
  question_id = excluded.question_id,
  choice_text = excluded.choice_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

do $$
declare
  undersized_sections text;
begin
  select string_agg(section_code || ': ' || question_count, ', ')
  into undersized_sections
  from (
    select certification_sections.code as section_code, count(*)::text as question_count
    from public.questions
    join public.certification_sections on certification_sections.id = questions.section_id
    where questions.is_active
    group by certification_sections.code
    having count(*) < 100
  ) counts;

  if undersized_sections is not null then
    raise exception 'EPA 608 seed requires at least 100 active questions per section: %', undersized_sections;
  end if;
end
$$;
