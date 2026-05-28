export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'short' | 'long' | 'true_false' | 'fill_blank';
export type AssignmentDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  subject: string;
  className: string;
  totalMarks: number;
  duration: string;
  sections: Section[];
  generatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: AssignmentDifficulty;
  additionalInstructions?: string;
  fileName?: string;
  status: AssignmentStatus;
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  error?: string;
  schoolCode?: string;
  teacherId?: string;
  teacherName?: string;
  published?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: AssignmentDifficulty;
  additionalInstructions?: string;
  file?: File;
  schoolCode?: string;
  teacherId?: string;
  teacherName?: string;
  published?: boolean;
}

export interface WSMessage {
  type: 'connected' | 'status_update' | 'progress' | 'completed' | 'failed';
  status?: AssignmentStatus;
  message?: string;
  progress?: number;
  assignmentId?: string;
  clientId?: string;
}
