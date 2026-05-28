'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';

export default function SchoolReportsPage() {
  const user = useAuthStore((s) => s.user);
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { submissions, fetchSubmissions } = useSubmissionStore();

  useEffect(() => {
    if (!user?.schoolCode) return;
    fetchAssignments({ schoolCode: user.schoolCode });
    fetchSubmissions({ schoolCode: user.schoolCode });
  }, [user?.schoolCode, fetchAssignments, fetchSubmissions]);

  return (
    <PortalShell title="Reports & Tests" subtitle="Full information on every test and who submitted">
      {assignments.map((a) => {
        const subs = submissions.filter((s) => s.assignmentId === a._id);
        return (
          <section key={a._id} className="dash-panel" style={{ marginBottom: 20 }}>
            <div className="dash-panel-head">
              <div>
                <h3>{a.title}</h3>
                <p className="text-muted">{a.subject} · {a.className} · Teacher: {a.teacherName ?? '—'}</p>
              </div>
              <span className={`badge-status status-${a.status}`}>{a.status}</span>
            </div>
            <p className="text-muted" style={{ marginBottom: 12 }}>
              Due {format(new Date(a.dueDate), 'dd MMM yyyy')} · {a.totalMarks} marks · {subs.length} submission(s)
            </p>
            {subs.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Roll</th><th>Score</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s._id}>
                      <td>{s.studentName}</td>
                      <td>{s.rollNumber}</td>
                      <td><strong>{s.score}/{s.maxScore}</strong></td>
                      <td>{format(new Date(s.submittedAt), 'dd-MM-yyyy HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No students have submitted this test yet.</p>
            )}
          </section>
        );
      })}
      {!assignments.length && <p className="text-muted">No assignments found for this school.</p>}
    </PortalShell>
  );
}
