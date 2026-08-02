export interface Profile {
  id: string;
  full_name: string;
  is_premium: boolean;
}

export interface QuizAttempt {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}
