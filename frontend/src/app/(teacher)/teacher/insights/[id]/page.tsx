'use client';

import { useEffect, use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';
import { useAuthStore } from '@/store/authStore';

export default function TeacherInsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);
  const { currentAssignment, fetchAssignment } = useAssignmentStore();
  const { submissions, fetchSubmissions } = useSubmissionStore();

  useEffect(() => { fetchAssignment(id); }, [id, fetchAssignment]);
  useEffect(() => {
    if (user?.id) fetchSubmissions({ teacherId: user.id, assignmentId: id });
  }, [user?.id, id, fetchSubmissions]);

  const subs = submissions.filter((s) => s.assignmentId === id);
  const a = currentAssignment;

  return (
    <PortalShell title="Submission insights" subtitle={a?.title ?? 'Assignment'}>
      <div className="insight-banner">
        <p>Students who <strong>submitted</strong> this test. Teachers do not see the full school leaderboard here.</p>
        <Link href={`/teacher/${id}`} className="btn-outline">View question paper</Link>
      </div>

      <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><span className="stat-label">Submitted</span><span className="stat-value">{subs.length}</span></div>
        <div className="stat-card"><span className="stat-label">Class</span><span className="stat-value">{a?.className ?? '—'}</span></div>
        <div className="stat-card"><span className="stat-label">Max marks</span><span className="stat-value">{a?.totalMarks ?? '—'}</span></div>
        <div className="stat-card"><span className="stat-label">Avg score</span><span className="stat-value">{subs.length ? Math.round(subs.reduce((x, s) => x + s.score, 0) / subs.length) : 0}</span></div>
      </div>

      <div className="table-wrap dash-panel">
        <table className="data-table">
          <thead>
            <tr><th>Student</th><th>Roll</th><th>Class</th><th>Score</th><th>Submitted at</th><th>Status</th></tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.studentName}</strong></td>
                <td>{s.rollNumber}</td>
                <td>{s.className}</td>
                <td>{s.score} / {s.maxScore}</td>
                <td>{format(new Date(s.submittedAt), 'dd-MM-yyyy HH:mm')}</td>
                <td><span className="badge-status status-completed">Submitted</span></td>
              </tr>
            ))}
            {!subs.length && (
              <tr><td colSpan={6} className="text-muted">No submissions yet. Share the test with your class.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Link href="/teacher" className="btn-outline" style={{ marginTop: 20, display: 'inline-flex' }}>← Back to assignments</Link>
    </PortalShell>
  );
}
