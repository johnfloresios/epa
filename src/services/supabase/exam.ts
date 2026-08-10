import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';
import {
  CompleteExamAttemptPayload,
  CreateExamAttemptPayload,
  ExamAnswerRecord,
  ExamAttemptHistoryDetail,
  ExamAttemptRecord,
  SaveExamAnswerPayload,
} from '@/types/exam';
import { ActivityHistoryItem } from '@/types/practice';
import { Database } from '@/types/supabase';
import { calculateAccuracy } from '@/utils/practiceProgress';
import { coerceActivitySectionCode } from '@/utils/sections';

type SectionRow = Database['public']['Tables']['certification_sections']['Row'];
type TopicRow = Database['public']['Tables']['topics']['Row'];
type ExamAttemptRow = Database['public']['Tables']['exam_attempts']['Row'];
type ExamAnswerRow = Database['public']['Tables']['exam_answers']['Row'];

type ExamAttemptRowWithRelations = ExamAttemptRow & {
  certification_sections: Pick<SectionRow, 'code' | 'name'> | null;
};

const mapExamAttempt = (row: ExamAttemptRow): ExamAttemptRecord => ({
  id: row.id,
  userId: row.user_id,
  examType: coerceActivitySectionCode(row.exam_type),
  sectionId: row.section_id,
  questionCount: row.question_count,
  answeredCount: row.answered_count,
  correctCount: row.correct_count,
  scorePercent: Number(row.score_percent),
  startedAt: row.started_at,
  completedAt: row.completed_at,
  createdAt: row.created_at,
});

const mapExamAnswer = (row: ExamAnswerRow): ExamAnswerRecord => ({
  id: row.id,
  examAttemptId: row.exam_attempt_id,
  userId: row.user_id,
  sectionId: row.section_id,
  topicId: row.topic_id,
  questionOrder: row.question_order,
  sectionCode: coerceActivitySectionCode(row.section_code),
  sectionName: row.section_name ?? 'Exam',
  topicName: row.topic_name,
  questionId: row.question_id,
  questionVersion: row.question_version,
  questionText: row.question_text,
  explanation: row.explanation,
  selectedChoiceId: row.selected_choice_id,
  selectedChoiceText: row.selected_choice_text,
  correctChoiceId: row.correct_choice_id,
  correctChoiceText: row.correct_choice_text,
  isCorrect: row.is_correct,
  answeredAt: row.answered_at,
});

const mapActivityItem = (row: ExamAttemptRowWithRelations): ActivityHistoryItem => {
  const sectionCode = coerceActivitySectionCode(
    row.exam_type === 'UNIVERSAL' ? 'UNIVERSAL' : row.certification_sections?.code ?? row.exam_type,
  );
  const sectionName =
    row.exam_type === 'UNIVERSAL'
      ? 'Universal'
      : row.certification_sections?.name ?? 'Exam';

  return {
    id: row.id,
    type: 'exam',
    label: `${sectionName} Exam`,
    sectionCode,
    sectionName,
    topicName: null,
    correctCount: row.correct_count,
    questionCount: row.question_count,
    answeredCount: row.answered_count,
    accuracy: row.score_percent,
    completedAt: row.completed_at ?? row.created_at,
  };
};

const examAttemptSelectColumns = `
  *,
  certification_sections (
    code,
    name
  )
`;

export const examService = {
  createAttempt: async (
    payload: CreateExamAttemptPayload,
  ): Promise<ExamAttemptRecord> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: payload.userId,
        exam_type: payload.examType,
        section_id: payload.sectionId,
        question_count: payload.questionCount,
        answered_count: 0,
        correct_count: 0,
        score_percent: 0,
        started_at: payload.startedAt ?? new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapExamAttempt(data);
  },

  saveAnswer: async (payload: SaveExamAnswerPayload): Promise<void> => {
    assertSupabaseConfigured();

    const { error } = await supabase.from('exam_answers').upsert(
      {
        exam_attempt_id: payload.examAttemptId,
        user_id: payload.userId,
        section_id: payload.sectionId,
        topic_id: payload.topicId,
        question_order: payload.questionOrder,
        section_code: payload.sectionCode,
        section_name: payload.sectionName,
        topic_name: payload.topicName,
        question_id: payload.questionId,
        question_version: payload.questionVersion,
        question_text: payload.questionText,
        explanation: payload.explanation,
        selected_choice_id: payload.selectedChoiceId,
        selected_choice_text: payload.selectedChoiceText,
        correct_choice_id: payload.correctChoiceId,
        correct_choice_text: payload.correctChoiceText,
        is_correct: payload.isCorrect,
        answered_at: payload.answeredAt ?? new Date().toISOString(),
      },
      {
        onConflict: 'exam_attempt_id,question_id',
      },
    );

    if (error) {
      throw error;
    }
  },

  completeAttempt: async (
    payload: CompleteExamAttemptPayload,
  ): Promise<ExamAttemptRecord> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('exam_attempts')
      .update({
        question_count: payload.questionCount,
        answered_count: payload.answeredCount,
        correct_count: payload.correctCount,
        score_percent: payload.scorePercent,
        completed_at: payload.completedAt ?? new Date().toISOString(),
      })
      .eq('id', payload.examAttemptId)
      .eq('user_id', payload.userId)
      .is('completed_at', null)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      const fallback = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('id', payload.examAttemptId)
        .eq('user_id', payload.userId)
        .single();

      if (fallback.error) {
        throw fallback.error;
      }

      return mapExamAttempt(fallback.data);
    }

    return mapExamAttempt(data);
  },

  getRecentActivity: async (userId: string, limit = 5): Promise<ActivityHistoryItem[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('exam_attempts')
      .select(examAttemptSelectColumns)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as ExamAttemptRowWithRelations[]).map(mapActivityItem);
  },

  getCompletedAttemptCount: async (userId: string): Promise<number> => {
    assertSupabaseConfigured();

    const { count, error } = await supabase
      .from('exam_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (error) {
      throw error;
    }

    return count ?? 0;
  },

  getExamHistory: async (userId: string, limit = 25): Promise<ActivityHistoryItem[]> => {
    return examService.getRecentActivity(userId, limit);
  },

  getExamAttemptDetail: async (
    userId: string,
    attemptId: string,
  ): Promise<ExamAttemptHistoryDetail | null> => {
    assertSupabaseConfigured();

    const [attemptResult, answersResult] = await Promise.all([
      supabase
        .from('exam_attempts')
        .select(examAttemptSelectColumns)
        .eq('id', attemptId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('exam_answers')
        .select('*')
        .eq('exam_attempt_id', attemptId)
        .eq('user_id', userId)
        .order('question_order', { ascending: true }),
    ]);

    if (attemptResult.error) {
      throw attemptResult.error;
    }

    if (answersResult.error) {
      throw answersResult.error;
    }

    if (!attemptResult.data) {
      return null;
    }

    const attempt = attemptResult.data as ExamAttemptRowWithRelations;
    const answers = (answersResult.data as ExamAnswerRow[]).map(mapExamAnswer);
    const sectionCode = coerceActivitySectionCode(
      attempt.exam_type === 'UNIVERSAL'
        ? 'UNIVERSAL'
        : attempt.certification_sections?.code ?? attempt.exam_type,
    );
    const sectionName =
      attempt.exam_type === 'UNIVERSAL'
        ? 'Universal'
        : attempt.certification_sections?.name ?? 'Exam';

    return {
      id: attempt.id,
      examType: coerceActivitySectionCode(attempt.exam_type),
      sectionCode,
      sectionName,
      correctCount: attempt.correct_count,
      answeredCount: attempt.answered_count,
      questionCount: attempt.question_count,
      accuracy: calculateAccuracy(attempt.correct_count, attempt.answered_count),
      completedAt: attempt.completed_at,
      questionHistory: answers,
    };
  },

  getExamAnswerDetail: async (
    userId: string,
    answerId: string,
  ): Promise<ExamAnswerRecord | null> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('exam_answers')
      .select('*')
      .eq('id', answerId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapExamAnswer(data);
  },
};
