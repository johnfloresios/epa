import { NavigatorScreenParams } from '@react-navigation/native';
import { ActivitySectionCode } from '@/types/content';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type PracticeRouteParams =
  | {
      presetSectionId?: string;
      presetTopicId?: string | null;
      presetQuestionIds?: string[];
      presetTitle?: string;
      presetCount?: number | 'all';
      autoStart?: boolean;
      focusReason?: string;
    }
  | undefined;

export type PracticeHistoryRouteParamList = {
  PracticeSessionDetail: {
    sessionId: string;
  };
  PracticeQuestionDetail: {
    answerId: string;
  };
};

export type ExamHistoryRouteParamList = {
  ExamAttemptDetail: {
    attemptId: string;
  };
  ExamQuestionDetail: {
    answerId: string;
  };
};

export type ActivityStackParamList = PracticeHistoryRouteParamList & ExamHistoryRouteParamList;

export type HomeStackParamList = ActivityStackParamList & {
  Home: undefined;
};

export type PracticeStackParamList = {
  PracticeHome: PracticeRouteParams;
};

export type ExamRouteParams =
  | {
      presetExamType?: ActivitySectionCode;
    }
  | undefined;

export type ExamsStackParamList = ExamHistoryRouteParamList & {
  ExamsHome: ExamRouteParams;
};

export type ProgressStackParamList = ActivityStackParamList & {
  ProgressHome: undefined;
  Readiness: undefined;
  WeakAreas: undefined;
  MissedQuestions: undefined;
  MissedQuestionDetail: {
    questionId: string;
  };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  PracticeTab: NavigatorScreenParams<PracticeStackParamList> | undefined;
  ExamsTab: NavigatorScreenParams<ExamsStackParamList> | undefined;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
