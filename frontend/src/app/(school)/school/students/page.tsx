'use client';

import { PortalShell } from '@/components/PortalShell';
import { useAuthStore, getUsersBySchool } from '@/store/authStore';
import { useSubmissionStore } from '@/store/submissionStore';
import { useEffect } from 'react';

export default function SchoolStudentsPage() {
  const user = useAuthStore((s) => s.user);
  const { submissions, fetchSubmissions } = useSubmissionStore();
  const students = getUsersBySchool(user?.schoolCode ?? '').filter((u) => u.role === 'student');

  useEffect(() => {
    if (user?.schoolCode) fetchSubmissions({ schoolCode: user.schoolCode });
  }, [user?.schoolCode, fetchSubmissions]);

  return (
    <PortalShell title="Students" subtitle="Every student and their submission activity">
      <div className="table-wrap dash-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll</th>
              <th>Class</th>
              <th>Email</th>
              <th>Tests submitted</th>
              <th>Avg score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const subs = submissions.filter((sub) => sub.studentId === s.id);
              const avg = subs.length ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length) : 0;
              return (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.rollNumber}</td>
                  <td>{s.className}</td>
                  <td className="text-muted">{s.email}</td>
                  <td>{subs.length}</td>
                  <td>{subs.length ? `${avg}%` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
