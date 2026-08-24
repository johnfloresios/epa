# EPA 608 question-draft automation

This workflow fetches the official EPA pages listed in `epa608-sources.json`,
generates cited question drafts with the OpenAI Responses API, and writes a dated
JSON review file under `content/drafts/`.

It never writes to Supabase. Every accepted draft is marked
`PENDING_HUMAN_REVIEW` and must be reviewed by a qualified EPA Section 608
subject-matter expert before publication.

## Run

```bash
export OPENAI_API_KEY='your-api-key'
npm run questions:generate
```

Optional controls:

```bash
OPENAI_MODEL='gpt-5.6-luna' QUESTIONS_PER_SOURCE=8 npm run questions:generate
```

`QUESTIONS_PER_SOURCE` must be between 1 and 25. The generator stores the source
URL, retrieval time, SHA-256 content hash, and a short verbatim supporting excerpt
with every draft. It rejects drafts with duplicate choices, multiple correct
answers, unsupported excerpts, invalid section mappings, or duplicates within the
same run.
