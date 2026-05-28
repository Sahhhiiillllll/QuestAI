'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';
import { useAuthStore } from '@/store/authStore';
import { Question, Section } from '@/types';

export default function StudentAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { currentAssignment, fetchAssignment, isLoading } = useAssignmentStore();
  const { submitTest } = useSubmissionStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => { fetchAssignment(id); }, [id, fetchAssignment]);

  const paper = currentAssignment?.generatedPaper;
  const allQuestions = paper?.sections.flatMap((s: Section) => s.questions) ?? [];

  const setAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !currentAssignment) return;
    setSubmitting(true);
    setError('');
    const result = await submitTest({
      assignmentId: id,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      rollNumber: user.rollNumber ?? '',
      className: user.className ?? '',
      schoolCode: user.schoolCode,
      answers: allQuestions.map((q: Question) => ({ questionId: q.id, value: answers[q.id] ?? '' })),
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Submit failed');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/student'), 2000);
  };

  if (isLoading && !currentAssignment) {
    return <PortalShell><p className="text-muted" style={{ padding: 48, textAlign: 'center' }}>Loading test...</p></PortalShell>;
  }

  if (currentAssignment?.status !== 'completed' || !paper) {
    return (
      <PortalShell title="Test unavailable">
        <p className="text-muted">This test is not ready yet. Check back later.</p>
      </PortalShell>
    );
  }

  if (done) {
    return (
      <PortalShell title="Submitted!">
        <div className="empty-state">
          <div className="empty-illustration">✓</div>
          <h2>Test submitted successfully</h2>
          <p>Redirecting to your tests...</p>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title={currentAssignment.title} subtitle={`Due ${format(new Date(currentAssignment.dueDate), 'dd MMM yyyy HH:mm')}`}>
      <div className="student-attempt-banner">
        <span>{user?.name} · Roll {user?.rollNumber} · {user?.className}</span>
        <span>{paper.totalMarks} marks · {paper.duration}</span>
      </div>

      <div className="exam-paper">
        <div className="exam-header">
          <h2>{user?.schoolName}</h2>
          <div className="exam-meta">
            <span>Subject: <strong>{paper.subject}</strong></span>
            <span>Class: <strong>{paper.className}</strong></span>
          </div>
        </div>

        {paper.sections.map((section: Section, si: number) => (
          <div key={si} className="section-block">
            <h3>{section.title}</h3>
            <p className="section-instruction">{section.instruction}</p>
            {section.questions.map((q: Question, qi: number) => (
              <div key={q.id} className="attempt-question">
                <p className="attempt-q-text"><strong>{qi + 1}.</strong> {q.text} <span className="tag tag-marks">[{q.marks} marks]</span></p>
                <textarea
                  className="input-field"
                  rows={q.type === 'long' ? 4 : 2}
                  placeholder="Type your answer here..."
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="form-footer">
        <button type="button" className="btn-outline" onClick={() => router.push('/student')}>Cancel</button>
        <button type="button" className="btn-dark" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit test'}
        </button>
      </div>
    </PortalShell>
  );
}
