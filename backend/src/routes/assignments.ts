import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Assignment } from '../models/Assignment';
import { assignmentQueue, GenerationJobData } from '../services/queue';
import { cacheGet, cacheSet, cacheDel } from '../services/redis';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Create assignment & enqueue generation
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const {
      title, subject, className, dueDate,
      questionTypes, totalQuestions, totalMarks,
      difficulty, additionalInstructions,
      schoolCode, teacherId, teacherName, published,
    } = req.body;

    // Validation
    if (!title || !subject || !className || !dueDate || !totalQuestions || !totalMarks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (parseInt(totalQuestions) < 1 || parseInt(totalMarks) < 1) {
      return res.status(400).json({ error: 'Questions and marks must be positive' });
    }

    const types = Array.isArray(questionTypes) ? questionTypes : [questionTypes || 'short'];

    let fileContent: string | undefined;
    let fileName: string | undefined;

    if (req.file) {
      fileContent = req.file.buffer.toString('utf-8');
      fileName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title, subject, className,
      dueDate: new Date(dueDate),
      questionTypes: types,
      totalQuestions: parseInt(totalQuestions),
      totalMarks: parseInt(totalMarks),
      difficulty: difficulty || 'mixed',
      additionalInstructions,
      fileContent,
      fileName,
      status: 'pending',
      schoolCode: schoolCode ? String(schoolCode).toUpperCase() : undefined,
      teacherId: teacherId || undefined,
      teacherName: teacherName || undefined,
      published: published !== 'false' && published !== false,
    });

    const jobData: GenerationJobData = {
      assignmentId: assignment._id.toString(),
      title, subject, className,
      questionTypes: types,
      totalQuestions: parseInt(totalQuestions),
      totalMarks: parseInt(totalMarks),
      difficulty: difficulty || 'mixed',
      additionalInstructions,
      fileContent,
    };

    const job = await assignmentQueue.add('generate', jobData, {
      jobId: `assignment-${assignment._id}`,
    });

    await assignment.updateOne({ jobId: job.id });

    return res.status(201).json({
      success: true,
      assignmentId: assignment._id,
      jobId: job.id,
      message: 'Assignment created, generation queued',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

// Get all assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolCode, teacherId, published, className } = req.query;
    const filter: Record<string, unknown> = {};
    if (schoolCode) filter.schoolCode = String(schoolCode).toUpperCase();
    if (teacherId) filter.teacherId = String(teacherId);
    if (className) filter.className = String(className);
    if (published === 'true') filter.published = true;

    const cacheKey = `assignments:list:${JSON.stringify(filter)}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return res.json(cached);

    const assignments = await Assignment.find(filter)
      .select('-fileContent')
      .sort({ createdAt: -1 })
      .limit(100);

    await cacheSet(cacheKey, assignments, 60);
    return res.json(assignments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

// Get single assignment with generated paper
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cached = await cacheGet<unknown>(`assignment:${id}`);
    if (cached) return res.json(cached);

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (assignment.status === 'completed') {
      await cacheSet(`assignment:${id}`, assignment, 3600);
    }

    return res.json(assignment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

// Regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    await assignment.updateOne({ status: 'pending', generatedPaper: undefined, error: undefined });
    await cacheDel(`assignment:${id}`);

    const jobData: GenerationJobData = {
      assignmentId: id,
      title: assignment.title,
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes,
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent,
    };

    const job = await assignmentQueue.add('generate', jobData);
    await assignment.updateOne({ jobId: job.id });

    return res.json({ success: true, jobId: job.id, message: 'Regeneration queued' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

// Delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    await cacheDel(`assignment:${id}`);
    await cacheDel('assignments:list');
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
