import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const assignmentQueue = new Queue('assignment-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export interface GenerationJobData {
  assignmentId: string;
  title: string;
  subject: string;
  className: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
}
