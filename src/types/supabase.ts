export type Database = {
  public: {
    Tables: {
      certification_sections: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exam_answers: {
        Row: {
          id: string;
          exam_attempt_id: string;
          user_id: string;
          section_id: string;
          topic_id: string | null;
          question_order: number;
          section_code: string | null;
          section_name: string | null;
          topic_name: string | null;
          question_id: string;
          question_version: number;
          question_text: string | null;
          explanation: string | null;
          selected_choice_id: string;
          selected_choice_text: string | null;
          correct_choice_id: string | null;
          correct_choice_text: string | null;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          exam_attempt_id: string;
          user_id: string;
          section_id: string;
          topic_id?: string | null;
          question_order?: number;
          section_code?: string | null;
          section_name?: string | null;
          topic_name?: string | null;
          question_id: string;
          question_version?: number;
          question_text?: string | null;
          explanation?: string | null;
          selected_choice_id: string;
          selected_choice_text?: string | null;
          correct_choice_id?: string | null;
          correct_choice_text?: string | null;
          is_correct: boolean;
          answered_at?: string;
        };
        Update: {
          id?: string;
          exam_attempt_id?: string;
          user_id?: string;
          section_id?: string;
          topic_id?: string | null;
          question_order?: number;
          section_code?: string | null;
          section_name?: string | null;
          topic_name?: string | null;
          question_id?: string;
          question_version?: number;
          question_text?: string | null;
          explanation?: string | null;
          selected_choice_id?: string;
          selected_choice_text?: string | null;
          correct_choice_id?: string | null;
          correct_choice_text?: string | null;
          is_correct?: boolean;
          answered_at?: string;
        };
        Relationships: [];
      };
      exam_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_type: string;
          section_id: string | null;
          question_count: number;
          answered_count: number;
          correct_count: number;
          score_percent: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_type: string;
          section_id?: string | null;
          question_count: number;
          answered_count?: number;
          correct_count?: number;
          score_percent?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_type?: string;
          section_id?: string | null;
          question_count?: number;
          answered_count?: number;
          correct_count?: number;
          score_percent?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_attempts_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'certification_sections';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      practice_answers: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          section_id: string;
          topic_id: string | null;
          question_order: number;
          section_code: string | null;
          section_name: string | null;
          topic_name: string | null;
          question_id: string;
          question_version: number;
          question_text: string | null;
          explanation: string | null;
          selected_choice_id: string;
          selected_choice_text: string | null;
          correct_choice_id: string | null;
          correct_choice_text: string | null;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          section_id: string;
          topic_id?: string | null;
          question_order?: number;
          section_code?: string | null;
          section_name?: string | null;
          topic_name?: string | null;
          question_id: string;
          question_version?: number;
          question_text?: string | null;
          explanation?: string | null;
          selected_choice_id: string;
          selected_choice_text?: string | null;
          correct_choice_id?: string | null;
          correct_choice_text?: string | null;
          is_correct: boolean;
          answered_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          section_id?: string;
          topic_id?: string | null;
          question_order?: number;
          section_code?: string | null;
          section_name?: string | null;
          topic_name?: string | null;
          question_id?: string;
          question_version?: number;
          question_text?: string | null;
          explanation?: string | null;
          selected_choice_id?: string;
          selected_choice_text?: string | null;
          correct_choice_id?: string | null;
          correct_choice_text?: string | null;
          is_correct?: boolean;
          answered_at?: string;
        };
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          topic_id: string | null;
          question_count: number;
          correct_count: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          topic_id?: string | null;
          question_count: number;
          correct_count?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          section_id?: string;
          topic_id?: string | null;
          question_count?: number;
          correct_count?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'practice_sessions_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'certification_sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'practice_sessions_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      question_choices: {
        Row: {
          id: string;
          question_id: number;
          choice_text: string;
          is_correct: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: number;
          choice_text: string;
          is_correct?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: number;
          choice_text?: string;
          is_correct?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_choices_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          id: number;
          public_id: string;
          section_id: string;
          topic_id: string | null;
          question_text: string;
          explanation: string | null;
          difficulty: 'easy' | 'medium' | 'hard';
          reference: string | null;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          public_id?: string;
          section_id: string;
          topic_id?: string | null;
          question_text: string;
          explanation?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard';
          reference?: string | null;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          public_id?: string;
          section_id?: string;
          topic_id?: string | null;
          question_text?: string;
          explanation?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard';
          reference?: string | null;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'certification_sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'questions_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      topics: {
        Row: {
          id: string;
          section_id: string;
          code: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          code: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_section_performance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          section_id: string;
          section_code: string;
          section_name: string;
          answered_count: number;
          correct_count: number;
          incorrect_count: number;
          accuracy: number;
        }[];
      };
      get_topic_performance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          section_id: string;
          section_code: string;
          section_name: string;
          topic_id: string;
          topic_name: string;
          answered_count: number;
          correct_count: number;
          incorrect_count: number;
          accuracy: number;
        }[];
      };
      get_missed_questions: {
        Args: { limit_count?: number };
        Returns: {
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
        }[];
      };
      get_question_attempt_history: {
        Args: { question_public_id: string };
        Returns: {
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
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
