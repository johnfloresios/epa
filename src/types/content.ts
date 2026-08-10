export type CertificationSectionCode = 'CORE' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III';
export type ActivitySectionCode = CertificationSectionCode | 'UNIVERSAL';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface CertificationSection {
  id: string;
  code: CertificationSectionCode;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface Topic {
  id: string;
  sectionId: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface QuestionChoice {
  id: string;
  text: string;
  sortOrder: number;
}

export interface QuestionChoiceWithAnswer extends QuestionChoice {
  isCorrect: boolean;
}

export interface QuestionSummary {
  id: string;
  sectionId: string;
  topicId: string | null;
  sectionCode: CertificationSectionCode;
  sectionName: string;
  topicName: string | null;
  text: string;
  difficulty: QuestionDifficulty;
  version: number;
  reference: string | null;
}

export interface QuestionDetail extends QuestionSummary {
  explanation: string | null;
  choices: QuestionChoiceWithAnswer[];
}
