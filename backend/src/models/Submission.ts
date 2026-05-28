import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionId: string;
  value: string;
}

export interface ISubmission extends Document {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  className: string;
  schoolCode: string;
  answers: IAnswer[];
  score: number;
  maxScore: number;
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    rollNumber: { type: String, required: true },
    className: { type: String, required: true },
    schoolCode: { type: String, required: true, index: true },
    answers: [{ questionId: String, value: String }],
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
