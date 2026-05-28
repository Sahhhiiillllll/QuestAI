'use client';

import { PortalShell } from '@/components/PortalShell';
import { useAuthStore, getUsersBySchool } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useEffect } from 'react';

export default function SchoolTeachersPage() {
  const user = useAuthStore((s) => s.user);
  const { assignments, fetchAssignments } = useAssignmentStore();
  const teachers = getUsersBySchool(user?.schoolCode ?? '').filter((u) => u.role === 'teacher');

  useEffect(() => {
    if (user?.schoolCode) fetchAssignments({ schoolCode: user.schoolCode });
  }, [user?.schoolCode, fetchAssignments]);

  return (
    <PortalShell title="Teachers" subtitle="All educators registered under your school">
      <div className="assignment-grid">
        {teachers.map((t) => {
          const tests = assignments.filter((a) => a.teacherId === t.id || a.teacherName === t.name);
          return (
            <article key={t.id} className="assignment-card">
              <div className="mini-user-row" style={{ marginBottom: 12 }}>
                <span className="profile-avatar">{t.name.charAt(0)}</span>
                <div>
                  <h3 style={{ margin: 0 }}>{t.name}</h3>
                  <p className="text-muted">{t.email}</p>
                </div>
              </div>
              <p className="assignment-card-meta">
                <div>Tests created: <strong>{tests.length}</strong></div>
                <div>Completed papers: <strong>{tests.filter((a) => a.status === 'completed').length}</strong></div>
              </p>
            </article>
          );
        })}
        {!teachers.length && <p className="text-muted">No teachers registered yet.</p>}
      </div>
    </PortalShell>
  );
}
