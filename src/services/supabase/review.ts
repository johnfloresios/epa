import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';
import { contentService } from '@/services/supabase/content';
import { studyConfig } from '@/config/study';
import { RecentActivityItem } from '@/types/practice';
import {
  MissedQuestionDetail,
  MissedQuestionSummary,
  PerformanceMetric,
  QuestionAttemptHistoryItem,
  ReviewInsightsSummary,
} from '@/types/review';
import { FocusedStudyPlan, ReadinessSummary } from '@/types/readiness';
import { buildFocusedStudyPlan, buildReadinessSummary } from '@/utils/readiness';
import { buildWeakAreas } from '@/utils/review';
import { coerceActivitySectionCode } from '@/utils/sections';

type PerformanceRow = {
  section_id: string;
  section_code: string;
  section_name: string;
  topic_id?: string | null;
  topic_name?: string | null;
  answered_count: number;
  correct_count: number;
  incorrect_count: number;
  accuracy: number;
};

type MissedQuestionRow = {
  question_id: string;
  section_id: string;
  section_code: string;
  section_name: string;
  topic_id: string | null;
  topic_name: string | null;
  question_text: string | null;
  attempts_count: number;
  incorrect_count: number;
  last_attempted: string;
  latest_answer_id: string;
  latest_question_version: number;
};

type AttemptHistoryRow = {
  answer_id: string;
  session_id: string;
  question_order: number;
  section_code: string;
  section_name: string;
  topic_name: string | null;
  question_text: string | null;
  selected_choice_text: string | null;
  correct_choice_text: string | null;
  is_correct: boolean;
  question_version: number;
  explanation: string | null;
  answered_at: string;
};

const mapPerformanceMetric = (row: PerformanceRow): PerformanceMetric => ({
  sectionId: row.section_id,
  sectionCode: coerceActivitySectionCode(row.section_code),
  sectionName: row.section_name,
  topicId: row.topic_id ?? null,
  topicName: row.topic_name ?? null,
  answeredCount: Number(row.answered_count),
  correctCount: Number(row.correct_count),
  incorrectCount: Number(row.incorrect_count),
  accuracy: Number(row.accuracy),
});

const mapMissedQuestion = (row: MissedQuestionRow): MissedQuestionSummary => ({
  questionId: row.question_id,
  sectionId: row.section_id,
  sectionCode: coerceActivitySectionCode(row.section_code),
  sectionName: row.section_name,
  topicId: row.topic_id,
  topicName: row.topic_name,
  questionText: row.question_text,
  attemptsCount: Number(row.attempts_count),
  incorrectCount: Number(row.incorrect_count),
  lastAttempted: row.last_attempted,
  latestAnswerId: row.latest_answer_id,
  latestQuestionVersion: Number(row.latest_question_version),
});

const mapAttemptHistory = (row: AttemptHistoryRow): QuestionAttemptHistoryItem => ({
  answerId: row.answer_id,
  sessionId: row.session_id,
  questionOrder: Number(row.question_order),
  sectionCode: coerceActivitySectionCode(row.section_code),
  sectionName: row.section_name,
  topicName: row.topic_name,
  questionText: row.question_text,
  selectedChoiceText: row.selected_choice_text,
  correctChoiceText: row.correct_choice_text,
  isCorrect: row.is_correct,
  questionVersion: Number(row.question_version),
  explanation: row.explanation,
  answeredAt: row.answered_at,
});

export const reviewService = {
  getSectionPerformance: async (): Promise<PerformanceMetric[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase.rpc('get_section_performance');

    if (error) {
      throw error;
    }

    return (data as PerformanceRow[]).map(mapPerformanceMetric);
  },

  getTopicPerformance: async (): Promise<PerformanceMetric[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase.rpc('get_topic_performance');

    if (error) {
      throw error;
    }

    return (data as PerformanceRow[]).map(mapPerformanceMetric);
  },

  getWeakAreas: async () => {
    const [sectionPerformance, topicPerformance] = await Promise.all([
      reviewService.getSectionPerformance(),
      reviewService.getTopicPerformance(),
    ]);

    return buildWeakAreas(sectionPerformance, topicPerformance);
  },

  getMissedQuestions: async (
    limitCount = 100,
    sectionId?: string,
  ): Promise<MissedQuestionSummary[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase.rpc('get_missed_questions', {
      limit_count: limitCount,
    });

    if (error) {
      throw error;
    }

    const questions = (data as MissedQuestionRow[]).map(mapMissedQuestion);

    if (!sectionId) {
      return questions;
    }

    return questions.filter((question) => question.sectionId === sectionId);
  },

  getQuestionAttemptHistory: async (
    questionId: string,
  ): Promise<QuestionAttemptHistoryItem[]> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase.rpc('get_question_attempt_history', {
      question_public_id: questionId,
    });

    if (error) {
      throw error;
    }

    return (data as AttemptHistoryRow[]).map(mapAttemptHistory);
  },

  getMissedQuestionDetail: async (
    questionId: string,
  ): Promise<MissedQuestionDetail | null> => {
    const attemptHistory = await reviewService.getQuestionAttemptHistory(questionId);

    if (attemptHistory.length === 0) {
      return null;
    }

    const mostRecent = attemptHistory[0];

    return {
      questionId,
      sectionCode: mostRecent.sectionCode,
      sectionName: mostRecent.sectionName,
      topicName: mostRecent.topicName,
      questionText: mostRecent.questionText,
      mostRecentAnswer: mostRecent.selectedChoiceText,
      correctAnswer: mostRecent.correctChoiceText,
      explanation: mostRecent.explanation,
      attemptHistory,
    };
  },

  getReviewInsights: async (): Promise<ReviewInsightsSummary> => {
    const [sectionPerformance, topicPerformance, missedQuestions] = await Promise.all([
      reviewService.getSectionPerformance(),
      reviewService.getTopicPerformance(),
      reviewService.getMissedQuestions(100),
    ]);

    return {
      sectionPerformance,
      topicPerformance,
      weakAreas: buildWeakAreas(sectionPerformance, topicPerformance),
      missedQuestions,
    };
  },

  getFocusedStudyPlan: async (): Promise<FocusedStudyPlan | null> => {
    const [sectionPerformance, topicPerformance, missedQuestions] = await Promise.all([
      reviewService.getSectionPerformance(),
      reviewService.getTopicPerformance(),
      reviewService.getMissedQuestions(100),
    ]);

    const weakAreas = buildWeakAreas(sectionPerformance, topicPerformance);
    const actionableTopic = weakAreas.find(
      (area) =>
        area.type === 'topic' &&
        (area.status === 'needs_attention' || area.status === 'developing'),
    ) ?? null;
    const actionableSection = weakAreas.find(
      (area) =>
        area.type === 'section' &&
        (area.status === 'needs_attention' || area.status === 'developing'),
    ) ?? null;

    const targetSectionId = actionableTopic?.sectionId ?? actionableSection?.sectionId ?? null;

    if (!targetSectionId) {
      return null;
    }

    const [sectionQuestions, topicQuestions] = await Promise.all([
      contentService.getQuestionsBySection(targetSectionId),
      actionableTopic?.topicId
        ? contentService.getQuestionsByTopic(actionableTopic.topicId)
        : Promise.resolve([]),
    ]);

    return buildFocusedStudyPlan({
      sectionReadiness: buildReadinessSummary({
        sectionPerformance,
        topicPerformance,
        weakAreas,
        missedQuestions,
        focusedStudyPlan: null,
      }).sectionReadiness,
      weakAreas,
      missedQuestions,
      sectionQuestionIds: sectionQuestions.map((question) => question.id),
      topicQuestionIds: topicQuestions.map((question) => question.id),
    });
  },

  getReadinessSummary: async (): Promise<ReadinessSummary> => {
    const [sectionPerformance, topicPerformance, missedQuestions] = await Promise.all([
      reviewService.getSectionPerformance(),
      reviewService.getTopicPerformance(),
      reviewService.getMissedQuestions(100),
    ]);
    const weakAreas = buildWeakAreas(sectionPerformance, topicPerformance);

    let focusedStudyPlan: FocusedStudyPlan | null = null;

    try {
      focusedStudyPlan = await reviewService.getFocusedStudyPlan();
    } catch {
      // Focused study is an enhancement. Core readiness should still render when
      // a question lookup or optional history source is temporarily unavailable.
      focusedStudyPlan = null;
    }

    return buildReadinessSummary({
      sectionPerformance,
      topicPerformance,
      weakAreas,
      missedQuestions,
      focusedStudyPlan,
    });
  },

  getFocusArea: async (): Promise<RecentActivityItem | null> => {
    return null;
  },

  getMissedQuestionPracticeIds: async (
    sectionId: string,
    limitCount = studyConfig.missedQuestionsPracticeLimit,
  ): Promise<string[]> => {
    const questions = await reviewService.getMissedQuestions(limitCount, sectionId);
    return questions.map((question) => question.questionId);
  },
};
