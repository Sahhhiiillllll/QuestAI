import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: 'mcq' | 'short' | 'long' | 'true_false' | 'fill_blank';
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
  totalMarks: number;
}

export interface IGeneratedPaper {
  subject: string;
  className: string;
  totalMarks: number;
  duration: string;
  sections: ISection[];
  generatedAt: Date;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions?: string;
  fileContent?: string;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  generatedPaper?: IGeneratedPaper;
  error?: string;
  schoolCode?: string;
  teacherId?: string;
  teacherName?: string;
  published?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  type: { type: String, enum: ['mcq', 'short', 'long', 'true_false', 'fill_blank'], required: true },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
  totalMarks: { type: Number, required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  subject: String,
  className: String,
  totalMarks: Number,
  duration: String,
  sections: [SectionSchema],
  generatedAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String }],
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    additionalInstructions: String,
    fileContent: String,
    fileName: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: String,
    generatedPaper: GeneratedPaperSchema,
    error: String,
    schoolCode: String,
    teacherId: String,
    teacherName: String,
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
