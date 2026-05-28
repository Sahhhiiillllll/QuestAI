'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';
import { useAuthStore } from '@/store/authStore';

export default function StudentTestsPage() {
  const user = useAuthStore((s) => s.user);
  const { assignments, isLoading, fetchAssignments } = useAssignmentStore();
  const { submissions, fetchSubmissions } = useSubmissionStore();
  const [tab, setTab] = useState<'available' | 'done'>('available');

  useEffect(() => {
    if (!user?.schoolCode) return;
    fetchAssignments({ schoolCode: user.schoolCode, published: true, className: user.className });
    fetchSubmissions({ schoolCode: user.schoolCode });
  }, [user, fetchAssignments, fetchSubmissions]);

  const mySubs = new Set(submissions.filter((s) => s.studentId === user?.id).map((s) => s.assignmentId));
  const available = assignments.filter((a) => a.status === 'completed' && !mySubs.has(a._id));
  const done = assignments.filter((a) => mySubs.has(a._id));
  const list = tab === 'available' ? available : done;

  return (
    <PortalShell title="My Tests" subtitle="Attempt published tests for your class only.">
      <div className="student-tabs">
        <button type="button" className={tab === 'available' ? 'tab-active' : ''} onClick={() => setTab('available')}>
          Available ({available.length})
        </button>
        <button type="button" className={tab === 'done' ? 'tab-active' : ''} onClick={() => setTab('done')}>
          Submitted ({done.length})
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted" style={{ padding: 48, textAlign: 'center' }}>Loading tests...</p>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">📋</div>
          <h2>{tab === 'available' ? 'No tests right now' : 'No submissions yet'}</h2>
          <p>{tab === 'available' ? 'Your teacher will publish tests here when ready.' : 'Complete a test from the Available tab.'}</p>
        </div>
      ) : (
        <div className="assignment-grid">
          {list.map((a) => (
            <article key={a._id} className="assignment-card student-test-card">
              <h3>{a.title}</h3>
              <div className="assignment-card-meta">
                <div>{a.subject} · {a.className}</div>
                <div>Due: {format(new Date(a.dueDate), 'dd MMM yyyy')}</div>
                <div>{a.totalQuestions} questions · {a.totalMarks} marks</div>
              </div>
              {tab === 'available' ? (
                <Link href={`/student/attempt/${a._id}`} className="btn-dark" style={{ marginTop: 16, display: 'inline-flex' }}>
                  Start test →
                </Link>
              ) : (
                <span className="badge-status status-completed" style={{ marginTop: 12, display: 'inline-block' }}>Submitted</span>
              )}
            </article>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
