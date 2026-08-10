import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';
import {
  CertificationSection,
  CertificationSectionCode,
  QuestionChoiceWithAnswer,
  QuestionDetail,
  QuestionSummary,
  Topic,
} from '@/types/content';
import { Database } from '@/types/supabase';

type SectionRow = Database['public']['Tables']['certification_sections']['Row'];
type TopicRow = Database['public']['Tables']['topics']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type QuestionChoiceRow = Database['public']['Tables']['question_choices']['Row'];

type QuestionRowWithChoices = QuestionRow & {
  certification_sections: Pick<SectionRow, 'code' | 'name'> | null;
  topics: Pick<TopicRow, 'name'> | null;
  question_choices: QuestionChoiceRow[];
};

type QuestionRowWithRelations = QuestionRow & {
  certification_sections: Pick<SectionRow, 'code' | 'name'> | null;
  topics: Pick<TopicRow, 'name'> | null;
};

const mapSection = (row: SectionRow): CertificationSection => ({
  id: row.id,
  code: row.code as CertificationSectionCode,
  name: row.name,
  description: row.description,
  sortOrder: row.sort_order,
});

const mapTopic = (row: TopicRow): Topic => ({
  id: row.id,
  sectionId: row.section_id,
  code: row.code,
  name: row.name,
  description: row.description,
  sortOrder: row.sort_order,
});

const mapQuestionSummaryWithRelations = (row: QuestionRowWithRelations): QuestionSummary => ({
  id: row.public_id,
  sectionId: row.section_id,
  topicId: row.topic_id,
  sectionCode: (row.certification_sections?.code ?? 'CORE') as CertificationSectionCode,
  sectionName: row.certification_sections?.name ?? 'Practice',
  topicName: row.topics?.name ?? null,
  text: row.question_text,
  difficulty: row.difficulty,
  version: row.version,
  reference: row.reference,
});

const mapChoice = (row: QuestionChoiceRow): QuestionChoiceWithAnswer => ({
  id: row.id,
  text: row.choice_text,
  sortOrder: row.sort_order,
  isCorrect: row.is_correct,
});

// TODO: For a production practice/exam flow, avoid sending `is_correct` to the client
// before answer evaluation if validation is moved server-side.

const mapQuestionDetail = (row: QuestionRowWithChoices): QuestionDetail => ({
  ...mapQuestionSummaryWithRelations(row),
  explanation: row.explanation,
  choices: [...row.question_choices]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapChoice),
});

const baseQuestionColumns = `
  id,
  public_id,
  section_id,
  topic_id,
  question_text,
  explanation,
  difficulty,
  reference,
  version,
  is_active,
  created_at,
  updated_at,
  certification_sections (
    code,
    name
  ),
  topics (
    name
  )
`;

const questionDetailColumns = `
  ${baseQuestionColumns},
  question_choices (
    id,
    question_id,
    choice_text,
    is_correct,
    sort_order,
    created_at,
    updated_at
  )
`;

export const contentService = {
  getCertificationSections: async (): Promise<CertificationSection[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('certification_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapSection);
  },

  getTopicsBySection: async (sectionId: string): Promise<Topic[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('section_id', sectionId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapTopic);
  },

  getQuestionsBySection: async (sectionId: string): Promise<QuestionSummary[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('questions')
      .select(baseQuestionColumns)
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data as QuestionRowWithRelations[]).map(mapQuestionSummaryWithRelations);
  },

  getQuestionsByTopic: async (topicId: string): Promise<QuestionSummary[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('questions')
      .select(baseQuestionColumns)
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data as QuestionRowWithRelations[]).map(mapQuestionSummaryWithRelations);
  },

  getQuestionsBySectionIds: async (sectionIds: string[]): Promise<QuestionSummary[]> => {
    assertSupabaseConfigured();

    if (sectionIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('questions')
      .select(baseQuestionColumns)
      .in('section_id', sectionIds)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data as QuestionRowWithRelations[]).map(mapQuestionSummaryWithRelations);
  },

  getQuestionById: async (questionId: string): Promise<QuestionDetail | null> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('questions')
      .select(questionDetailColumns)
      .eq('public_id', questionId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapQuestionDetail(data as QuestionRowWithChoices);
  },

  getQuestionDetailsByIds: async (questionIds: string[]): Promise<QuestionDetail[]> => {
    assertSupabaseConfigured();

    if (questionIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('questions')
      .select(questionDetailColumns)
      .in('public_id', questionIds)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    const questionMap = new Map(
      (data as QuestionRowWithChoices[]).map((row) => [row.public_id, mapQuestionDetail(row)]),
    );

    return questionIds
      .map((questionId) => questionMap.get(questionId))
      .filter((question): question is QuestionDetail => Boolean(question));
  },
};
