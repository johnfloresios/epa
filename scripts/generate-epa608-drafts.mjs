#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const sourceManifestPath = resolve(projectRoot, 'content/epa608-sources.json');
const outputDirectory = resolve(projectRoot, 'content/drafts');
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? 'gpt-5.6-luna';
const questionsPerSource = Number(process.env.QUESTIONS_PER_SOURCE ?? 8);
const allowedSections = new Set(['CORE', 'TYPE_I', 'TYPE_II', 'TYPE_III']);

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required. The script does not publish or store this key.');
}

if (!Number.isInteger(questionsPerSource) || questionsPerSource < 1 || questionsPerSource > 25) {
  throw new Error('QUESTIONS_PER_SOURCE must be an integer between 1 and 25.');
}

const decodeEntities = (value) =>
  value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const htmlToText = (html) =>
  decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const normalize = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim();
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const assertOfficialSource = (url) => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || (parsed.hostname !== 'epa.gov' && !parsed.hostname.endsWith('.epa.gov'))) {
    throw new Error(`Source is not an official HTTPS EPA URL: ${url}`);
  }
};

const fetchSource = async (source) => {
  assertOfficialSource(source.url);
  const response = await fetch(source.url, {
    headers: { 'user-agent': 'EPA608Ultimate-Question-Draft-Auditor/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${source.url}: HTTP ${response.status}`);
  }

  const text = htmlToText(await response.text());
  if (text.length < 500) {
    throw new Error(`Source did not contain enough readable text: ${source.url}`);
  }

  return {
    ...source,
    retrievedAt: new Date().toISOString(),
    sha256: sha256(text),
    text,
  };
};

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      minItems: questionsPerSource,
      maxItems: questionsPerSource,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['section', 'topic', 'question', 'choices', 'explanation', 'supportingQuote'],
        properties: {
          section: { type: 'string', enum: [...allowedSections] },
          topic: { type: 'string', minLength: 2 },
          question: { type: 'string', minLength: 20 },
          choices: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['text', 'isCorrect'],
              properties: {
                text: { type: 'string', minLength: 1 },
                isCorrect: { type: 'boolean' },
              },
            },
          },
          explanation: { type: 'string', minLength: 20 },
          supportingQuote: { type: 'string', minLength: 3 },
        },
      },
    },
  },
};

const extractOutputText = (response) => {
  if (typeof response.output_text === 'string') return response.output_text;

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }

  throw new Error('OpenAI response did not contain output text.');
};

const generateDrafts = async (source) => {
  const input = [
    `Create exactly ${questionsPerSource} original EPA Section 608 practice-question drafts.`,
    `Allowed sections for this source: ${source.sections.join(', ')}.`,
    'Use only the supplied source text. Do not use outside knowledge.',
    'Each question must test a distinct fact or realistic application of a fact.',
    'Provide four plausible choices with exactly one correct choice.',
    'Do not copy an official exam question or claim EPA endorsement.',
    'supportingQuote must be an exact contiguous excerpt of at most 20 words from the source.',
    'Avoid questions whose correctness depends on information absent from the source.',
    '',
    `SOURCE NAME: ${source.name}`,
    `SOURCE URL: ${source.url}`,
    `SOURCE TEXT: ${source.text.slice(0, 60000)}`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
      reasoning: { effort: 'medium' },
      text: {
        format: {
          type: 'json_schema',
          name: 'epa608_question_drafts',
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status}): ${await response.text()}`);
  }

  return JSON.parse(extractOutputText(await response.json())).questions;
};

const validateDraft = (draft, source, seenQuestions) => {
  const errors = [];
  const normalizedQuestion = normalize(draft.question);
  const normalizedSource = normalize(source.text);
  const correctChoices = draft.choices.filter((choice) => choice.isCorrect);
  const uniqueChoices = new Set(draft.choices.map((choice) => normalize(choice.text)));

  if (!allowedSections.has(draft.section) || !source.sections.includes(draft.section)) {
    errors.push('section is not allowed for this source');
  }
  if (correctChoices.length !== 1) errors.push('must contain exactly one correct choice');
  if (uniqueChoices.size !== 4) errors.push('choices must be unique');
  if (seenQuestions.has(normalizedQuestion)) errors.push('duplicate question in this run');
  if (draft.supportingQuote.trim().split(/\s+/).length > 20) {
    errors.push('supporting quote exceeds 20 words');
  }
  if (!normalizedSource.includes(normalize(draft.supportingQuote))) {
    errors.push('supporting quote was not found verbatim in the source');
  }

  seenQuestions.add(normalizedQuestion);
  return errors;
};

const manifest = JSON.parse(await readFile(sourceManifestPath, 'utf8'));
const seenQuestions = new Set();
const output = {
  generatedAt: new Date().toISOString(),
  model,
  status: 'DRAFT_REVIEW_REQUIRED',
  warning: 'Do not publish without review by a qualified EPA Section 608 subject-matter expert.',
  sources: [],
  questions: [],
};

for (const manifestSource of manifest) {
  const source = await fetchSource(manifestSource);
  const drafts = await generateDrafts(source);
  output.sources.push({
    name: source.name,
    url: source.url,
    sections: source.sections,
    retrievedAt: source.retrievedAt,
    sha256: source.sha256,
  });

  for (const draft of drafts) {
    const validationErrors = validateDraft(draft, source, seenQuestions);
    output.questions.push({
      ...draft,
      sourceName: source.name,
      sourceUrl: source.url,
      sourceRetrievedAt: source.retrievedAt,
      sourceSha256: source.sha256,
      reviewStatus: validationErrors.length === 0 ? 'PENDING_HUMAN_REVIEW' : 'REJECTED',
      validationErrors,
    });
  }
}

await mkdir(outputDirectory, { recursive: true });
const timestamp = new Date().toISOString().replaceAll(':', '-');
const outputPath = resolve(outputDirectory, `epa608-drafts-${timestamp}.json`);
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

const pending = output.questions.filter((question) => question.reviewStatus === 'PENDING_HUMAN_REVIEW').length;
const rejected = output.questions.length - pending;
process.stdout.write(`Created ${outputPath}\n${pending} pending review; ${rejected} rejected by validation.\n`);
