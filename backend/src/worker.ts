import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { redisConnection } from './services/redis';
import { GenerationJobData } from './services/queue';
import { generateQuestionPaper } from './services/aiGenerator';
import { Assignment } from './models/Assignment';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';

// Connect to MongoDB
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Worker: MongoDB connected');
});

// WebSocket notification (HTTP call to main server)
async function notifyFrontend(assignmentId: string, payload: object) {
  try {
    await fetch(`http://localhost:${process.env.PORT || 5000}/internal/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, ...payload }),
    });
  } catch (e) {
    console.error('Failed to notify frontend:', e);
  }
}

const worker = new Worker<GenerationJobData>(
  'assignment-generation',
  async (job: Job<GenerationJobData>) => {
    const { assignmentId, ...input } = job.data;
    console.log(`Processing job ${job.id} for assignment ${assignmentId}`);

    try {
      // Update status to processing
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'processing',
      });

      await notifyFrontend(assignmentId, {
        type: 'status_update',
        status: 'processing',
        message: 'AI is generating your question paper...',
        progress: 10,
      });

      await job.updateProgress(10);

      // Simulate progress updates
      await new Promise((r) => setTimeout(r, 1000));
      await notifyFrontend(assignmentId, {
        type: 'progress',
        status: 'processing',
        message: 'Structuring sections and questions...',
        progress: 40,
      });
      await job.updateProgress(40);

      // Generate the paper
      const generatedPaper = await generateQuestionPaper(input);

      await notifyFrontend(assignmentId, {
        type: 'progress',
        status: 'processing',
        message: 'Finalizing question paper...',
        progress: 80,
      });
      await job.updateProgress(80);

      // Save result
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        generatedPaper,
      });

      await job.updateProgress(100);

      await notifyFrontend(assignmentId, {
        type: 'completed',
        status: 'completed',
        message: 'Question paper generated successfully!',
        progress: 100,
        assignmentId,
      });

      console.log(`Job ${job.id} completed for assignment ${assignmentId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Job ${job.id} failed:`, message);

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        error: message,
      });

      await notifyFrontend(assignmentId, {
        type: 'failed',
        status: 'failed',
        message: `Generation failed: ${message}`,
        progress: 0,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

worker.on('completed', (job) => {
  console.log(`Worker: Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Worker: Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('BullMQ Worker started, waiting for jobs...');
