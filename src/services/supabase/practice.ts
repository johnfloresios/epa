import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';
import { studyConfig } from '@/config/study';
import { examService } from '@/services/supabase/exam';
import {
  ActivityHistoryItem,
  CompletePracticeSessionPayload,
  CreatePracticeSessionPayload,
  DashboardActivitySummary,
  PracticeAnswerRecord,
  PracticePerformanceItem,
  PracticeProgressSummary,
  PracticeSessionHistoryDetail,
  PracticeSessionRecord,
  RecordPracticeAnswerPayload,
  RecentActivityItem,
} from '@/types/practice';
import { Database } from '@/types/supabase';
import {
  buildSectionPerformanceItems,
  calculateAccuracy,
  createEmptyPracticeProgressSummary,
} from '@/utils/practiceProgress';
import { coerceActivitySectionCode } from '@/utils/sections';
import { buildDashboardSectionReadiness } from '@/utils/dashboardReadiness';

type SectionRow = Database['public']['Tables']['certification_sections']['Row'];
type TopicRow = Database['public']['Tables']['topics']['Row'];
type PracticeSessionRow = Database['public']['Tables']['practice_sessions']['Row'];
type PracticeAnswerRow = Database['public']['Tables']['practice_answers']['Row'];

type PracticeSessionRowWithRelations = PracticeSessionRow & {
  certification_sections: Pick<SectionRow, 'code' | 'name'> | null;
  topics: Pick<TopicRow, 'name'> | null;
};

const mapPracticeSession = (row: PracticeSessionRow): PracticeSessionRecord => ({
  id: row.id,
  userId: row.user_id,
  sectionId: row.section_id,
  topicId: row.topic_id,
  questionCount: row.question_count,
  correctCount: row.correct_count,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  createdAt: row.created_at,
});

const mapPracticeAnswer = (row: PracticeAnswerRow): PracticeAnswerRecord => ({
  id: row.id,
  sessionId: row.session_id,
  userId: row.user_id,
  sectionId: row.section_id,
  topicId: row.topic_id,
  questionOrder: row.question_order,
  sectionCode: (row.section_code ?? 'CORE') as PracticeAnswerRecord['sectionCode'],
  sectionName: row.section_name ?? 'Practice',
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

const mapActivityItem = (row: PracticeSessionRowWithRelations): RecentActivityItem => ({
  id: row.id,
  type: 'practice',
  label: row.topics?.name ?? row.certification_sections?.name ?? 'Practice',
  sectionCode: (row.certification_sections?.code ?? 'CORE') as RecentActivityItem['sectionCode'],
  sectionName: row.certification_sections?.name ?? 'Practice',
  topicName: row.topics?.name ?? null,
  correctCount: row.correct_count,
  questionCount: row.question_count,
  answeredCount: row.question_count,
  accuracy: calculateAccuracy(row.correct_count, row.question_count),
  completedAt: row.completed_at ?? row.created_at,
});

const buildPerformanceItems = (
  groups: Map<string, { correctCount: number; answeredCount: number }>,
  labels: Map<string, string>,
): PracticePerformanceItem[] =>
  Array.from(groups.entries())
    .map(([id, metrics]) => ({
      id,
      label: labels.get(id) ?? 'Unknown',
      accuracy: calculateAccuracy(metrics.correctCount, metrics.answeredCount),
      correctCount: metrics.correctCount,
      answeredCount: metrics.answeredCount,
    }))
    .sort(
      (left, right) =>
        right.answeredCount - left.answeredCount || left.label.localeCompare(right.label),
    );

const sessionSelectColumns = `
  *,
  certification_sections (
    code,
    name
  ),
  topics (
    name
  )
`;

const getSettledValue = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === 'fulfilled' ? result.value : fallback;

export const practiceService = {
  createSession: async (
    payload: CreatePracticeSessionPayload,
  ): Promise<PracticeSessionRecord> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: payload.userId,
        section_id: payload.sectionId,
        topic_id: payload.topicId,
        question_count: payload.questionCount,
        correct_count: 0,
        started_at: payload.startedAt ?? new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapPracticeSession(data);
  },

  recordAnswer: async (payload: RecordPracticeAnswerPayload): Promise<void> => {
    assertSupabaseConfigured();

    const { error } = await supabase.from('practice_answers').upsert(
      {
        session_id: payload.sessionId,
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
        onConflict: 'session_id,question_id',
        ignoreDuplicates: true,
      },
    );

    if (error) {
      throw error;
    }
  },

  completeSession: async (
    payload: CompletePracticeSessionPayload,
  ): Promise<PracticeSessionRecord> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('practice_sessions')
      .update({
        question_count: payload.questionCount,
        correct_count: payload.correctCount,
        completed_at: payload.completedAt ?? new Date().toISOString(),
      })
      .eq('id', payload.sessionId)
      .eq('user_id', payload.userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapPracticeSession(data);
  },

  getRecentActivity: async (
    userId: string,
    limit = 5,
  ): Promise<RecentActivityItem[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('practice_sessions')
      .select(sessionSelectColumns)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as PracticeSessionRowWithRelations[]).map(mapActivityItem);
  },

  getDashboardSummary: async (
    userId: string,
    recentLimit = 5,
  ): Promise<DashboardActivitySummary> => {
    assertSupabaseConfigured();

    const practiceResult = await supabase
      .from('practice_sessions')
      .select(sessionSelectColumns)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (practiceResult.error) {
      throw practiceResult.error;
    }

    const [examActivityResult, examAttemptCountResult, examResults, practiceAnswersResult] = await Promise.allSettled([
      examService.getRecentActivity(userId, recentLimit),
      examService.getCompletedAttemptCount(userId),
      supabase
        .from('exam_attempts')
        .select('exam_type, score_percent')
        .eq('user_id', userId)
        .not('completed_at', 'is', null),
      supabase
        .from('practice_answers')
        .select('section_code, is_correct')
        .eq('user_id', userId),
    ]);

    const examActivity = getSettledValue(examActivityResult, []);
    const examAttempts = getSettledValue(examAttemptCountResult, 0);
    if (examResults.status === 'rejected') {
      throw examResults.reason;
    }

    if (practiceAnswersResult.status === 'rejected') {
      throw practiceAnswersResult.reason;
    }

    const examResultsQuery = examResults.value;
    const practiceAnswersQuery = practiceAnswersResult.value;
    const passedExamSectionCodes = Array.from(
      new Set(
        (examResultsQuery?.data ?? [])
          .filter((attempt) => attempt.score_percent >= studyConfig.examPassingScore)
          .map((attempt) => coerceActivitySectionCode(attempt.exam_type)),
      ),
    );
    const sectionReadiness = buildDashboardSectionReadiness(
      (practiceAnswersQuery?.data ?? [])
        .filter(
          (answer) =>
            answer.section_code === 'CORE' ||
            answer.section_code === 'TYPE_I' ||
            answer.section_code === 'TYPE_II' ||
            answer.section_code === 'TYPE_III',
        )
        .map((answer) => ({
          sectionCode: answer.section_code as 'CORE' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III',
          isCorrect: answer.is_correct,
        })),
      (examResultsQuery?.data ?? [])
        .filter(
          (attempt) =>
            attempt.exam_type === 'CORE' ||
            attempt.exam_type === 'TYPE_I' ||
            attempt.exam_type === 'TYPE_II' ||
            attempt.exam_type === 'TYPE_III',
        )
        .map((attempt) => ({
          sectionCode: attempt.exam_type as 'CORE' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III',
          score: attempt.score_percent,
        })),
    );
    const sessions = practiceResult.data as PracticeSessionRowWithRelations[];
    const practiceSessions = sessions.length;
    const practiceQuestionsAnswered = sessions.reduce(
      (count, session) => count + session.question_count,
      0,
    );
    const practiceCorrect = sessions.reduce((count, session) => count + session.correct_count, 0);
    const examQuestionsAnswered = examActivity.reduce(
      (count, attempt) => count + attempt.answeredCount,
      0,
    );
    const examCorrect = examActivity.reduce((count, attempt) => count + attempt.correctCount, 0);
    const questionsAnswered = practiceQuestionsAnswered + examQuestionsAnswered;
    const totalCorrect = practiceCorrect + examCorrect;
    const recentActivity = [...sessions.map(mapActivityItem), ...examActivity]
      .sort(
        (left, right) =>
          new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
      )
      .slice(0, recentLimit);

    return {
      overallAccuracy: calculateAccuracy(totalCorrect, questionsAnswered),
      questionsAnswered,
      practiceSessions,
      examAttempts,
      recentActivity,
      passedExamSectionCodes,
      sectionReadiness,
    };
  },

  getPracticeHistory: async (
    userId: string,
    limit = 25,
  ): Promise<ActivityHistoryItem[]> => {
    return practiceService.getRecentActivity(userId, limit);
  },

  getPracticeSessionDetail: async (
    userId: string,
    sessionId: string,
  ): Promise<PracticeSessionHistoryDetail | null> => {
    assertSupabaseConfigured();

    const [sessionResult, answersResult] = await Promise.all([
      supabase
        .from('practice_sessions')
        .select(sessionSelectColumns)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('practice_answers')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('question_order', { ascending: true }),
    ]);

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    if (answersResult.error) {
      throw answersResult.error;
    }

    if (!sessionResult.data) {
      return null;
    }

    const session = sessionResult.data as PracticeSessionRowWithRelations;
    const questionHistory = (answersResult.data as PracticeAnswerRow[]).map(mapPracticeAnswer);

    return {
      id: session.id,
      sectionCode: (session.certification_sections?.code ?? 'CORE') as PracticeSessionHistoryDetail['sectionCode'],
      sectionName: session.certification_sections?.name ?? 'Practice',
      topicName: session.topics?.name ?? null,
      correctCount: session.correct_count,
      questionCount: session.question_count,
      accuracy: calculateAccuracy(session.correct_count, session.question_count),
      completedAt: session.completed_at,
      questionHistory,
    };
  },

  getPracticeAnswerDetail: async (
    userId: string,
    answerId: string,
  ): Promise<PracticeAnswerRecord | null> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('practice_answers')
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

    return mapPracticeAnswer(data);
  },

  getProgressSummary: async (userId: string): Promise<PracticeProgressSummary> => {
    assertSupabaseConfigured();

    const [sectionsResult, topicsResult, sessionsResult, answersResult] = await Promise.all([
      supabase
        .from('certification_sections')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabase.from('topics').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }),
      supabase
        .from('practice_answers')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false }),
    ]);

    const [
      examAttemptsResult,
      examAnswersResult,
      recentExamsResult,
    ] = await Promise.allSettled([
      supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }),
      supabase
        .from('exam_answers')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false }),
      examService.getExamHistory(userId, 20),
    ]);

    if (sectionsResult.error) {
      throw sectionsResult.error;
    }

    if (topicsResult.error) {
      throw topicsResult.error;
    }

    if (sessionsResult.error) {
      throw sessionsResult.error;
    }

    if (answersResult.error) {
      throw answersResult.error;
    }

    const sections = sectionsResult.data as SectionRow[];
    const topics = topicsResult.data as TopicRow[];
    const sessions = (sessionsResult.data as PracticeSessionRow[]).map(mapPracticeSession);
    const answers = (answersResult.data as PracticeAnswerRow[]).map(mapPracticeAnswer);
    const examAttemptsQuery = examAttemptsResult.status === 'fulfilled'
      ? examAttemptsResult.value
      : null;
    const examAnswersQuery = examAnswersResult.status === 'fulfilled'
      ? examAnswersResult.value
      : null;
    const recentExams = getSettledValue(recentExamsResult, []);
    const examAttempts = examAttemptsQuery?.data ?? [];
    const completedExamAttemptIds = new Set(examAttempts.map((attempt) => attempt.id));
    const examAnswers = (examAnswersQuery?.data ?? [])
      .filter((answer) => completedExamAttemptIds.has(answer.exam_attempt_id))
      .map((answer) => ({
        sectionId: answer.section_id,
        topicId: answer.topic_id,
        isCorrect: answer.is_correct,
      }));

    if (sessions.length === 0 && answers.length === 0 && examAttempts.length === 0 && examAnswers.length === 0) {
      return createEmptyPracticeProgressSummary();
    }

    const sectionLabels = new Map(sections.map((section) => [section.id, section.name]));
    const sectionCodes = new Map(sections.map((section) => [section.id, section.code]));
    const topicLabels = new Map(topics.map((topic) => [topic.id, topic.name]));

    const totalCorrect =
      answers.filter((answer) => answer.isCorrect).length +
      examAnswers.filter((answer) => answer.isCorrect).length;
    const sectionGroups = new Map<string, { correctCount: number; answeredCount: number }>();
    const topicGroups = new Map<string, { correctCount: number; answeredCount: number }>();

    [...answers, ...examAnswers].forEach((answer) => {
      const sectionMetrics = sectionGroups.get(answer.sectionId) ?? {
        correctCount: 0,
        answeredCount: 0,
      };

      sectionMetrics.answeredCount += 1;
      sectionMetrics.correctCount += answer.isCorrect ? 1 : 0;
      sectionGroups.set(answer.sectionId, sectionMetrics);

      if (answer.topicId) {
        const topicMetrics = topicGroups.get(answer.topicId) ?? {
          correctCount: 0,
          answeredCount: 0,
        };

        topicMetrics.answeredCount += 1;
        topicMetrics.correctCount += answer.isCorrect ? 1 : 0;
        topicGroups.set(answer.topicId, topicMetrics);
      }
    });

    const recentSessions: ActivityHistoryItem[] = sessions.slice(0, 20).map((session) => ({
      id: session.id,
      type: 'practice',
      label: session.topicId
        ? topicLabels.get(session.topicId) ?? sectionLabels.get(session.sectionId) ?? 'Practice'
        : sectionLabels.get(session.sectionId) ?? 'Practice',
      sectionCode: coerceActivitySectionCode(sectionCodes.get(session.sectionId)),
      sectionName: sectionLabels.get(session.sectionId) ?? 'Practice',
      topicName: session.topicId ? topicLabels.get(session.topicId) ?? null : null,
      correctCount: session.correctCount,
      questionCount: session.questionCount,
      answeredCount: session.questionCount,
      accuracy: calculateAccuracy(session.correctCount, session.questionCount),
      completedAt: session.completedAt ?? session.createdAt,
    }));

    return {
      overallAccuracy: calculateAccuracy(totalCorrect, answers.length + examAnswers.length),
      practiceSessions: sessions.length,
      examAttempts: examAttempts.length,
      questionsAnswered: answers.length + examAnswers.length,
      correctAnswers: totalCorrect,
      sectionPerformance: buildSectionPerformanceItems(sections, sectionGroups),
      topicPerformance: buildPerformanceItems(topicGroups, topicLabels),
      recentSessions: [...recentSessions, ...recentExams].sort(
        (left, right) =>
          new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
      ),
    };
  },
};
