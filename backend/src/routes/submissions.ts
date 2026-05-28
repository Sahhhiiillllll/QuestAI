import { Router, Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { Assignment } from '../models/Assignment';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolCode, assignmentId, teacherId } = req.query;
    const filter: Record<string, string> = {};
    if (schoolCode) filter.schoolCode = String(schoolCode).toUpperCase();
    if (assignmentId) filter.assignmentId = String(assignmentId);

    let submissions = await Submission.find(filter).sort({ submittedAt: -1 }).limit(200);

    if (teacherId) {
      const assignments = await Assignment.find({ teacherId: String(teacherId) }).select('_id');
      const ids = new Set(assignments.map((a) => a._id.toString()));
      submissions = submissions.filter((s) => ids.has(s.assignmentId));
    }

    return res.json(submissions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      assignmentId,
      studentId,
      studentName,
      studentEmail,
      rollNumber,
      className,
      schoolCode,
      answers,
    } = req.body;

    if (!assignmentId || !studentId || !schoolCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.status !== 'completed') {
      return res.status(400).json({ error: 'Assignment not available' });
    }

    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted this test' });
    }

    const maxScore = assignment.totalMarks;
    const answerList = Array.isArray(answers) ? answers : [];
    const score = Math.round(maxScore * Math.min(1, answerList.filter((a: { value?: string }) => a.value?.trim()).length / Math.max(assignment.totalQuestions, 1)));

    const submission = await Submission.create({
      assignmentId,
      studentId,
      studentName,
      studentEmail,
      rollNumber,
      className,
      schoolCode: String(schoolCode).toUpperCase(),
      answers: answerList,
      score,
      maxScore,
    });

    return res.status(201).json(submission);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

router.get('/stats/:schoolCode', async (req: Request, res: Response) => {
  try {
    const schoolCode = req.params.schoolCode.toUpperCase();
    const submissions = await Submission.find({ schoolCode });
    const assignments = await Assignment.find({ schoolCode, status: 'completed' });

    const byAssignment: Record<string, { submitted: number; avgScore: number }> = {};
    submissions.forEach((s) => {
      if (!byAssignment[s.assignmentId]) {
        byAssignment[s.assignmentId] = { submitted: 0, avgScore: 0 };
      }
      byAssignment[s.assignmentId].submitted += 1;
      byAssignment[s.assignmentId].avgScore += s.score;
    });

    Object.keys(byAssignment).forEach((id) => {
      const n = byAssignment[id].submitted;
      if (n) byAssignment[id].avgScore = Math.round(byAssignment[id].avgScore / n);
    });

    return res.json({
      totalSubmissions: submissions.length,
      totalAssignments: assignments.length,
      uniqueStudents: new Set(submissions.map((s) => s.studentId)).size,
      byAssignment,
      leaderboard: submissions
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((s) => ({
          studentName: s.studentName,
          rollNumber: s.rollNumber,
          score: s.score,
          maxScore: s.maxScore,
          assignmentId: s.assignmentId,
        })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
