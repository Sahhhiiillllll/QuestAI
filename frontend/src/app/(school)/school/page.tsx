'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/PortalShell';
import { useAuthStore, getUsersBySchool } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';

export default function SchoolDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { stats, fetchSchoolStats, submissions, fetchSubmissions } = useSubmissionStore();

  useEffect(() => {
    if (!user?.schoolCode) return;
    fetchAssignments({ schoolCode: user.schoolCode });
    fetchSchoolStats(user.schoolCode);
    fetchSubmissions({ schoolCode: user.schoolCode });
  }, [user?.schoolCode, fetchAssignments, fetchSchoolStats, fetchSubmissions]);

  const teachers = getUsersBySchool(user?.schoolCode ?? '').filter((u) => u.role === 'teacher');
  const students = getUsersBySchool(user?.schoolCode ?? '').filter((u) => u.role === 'student');
  const completed = assignments.filter((a) => a.status === 'completed');

  return (
    <PortalShell title="School Dashboard" subtitle={`Full overview — ${user?.schoolName}`}>
      <div className="dash-stats-grid">
        <div className="stat-card stat-orange">
          <span className="stat-label">Teachers</span>
          <span className="stat-value">{teachers.length}</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-label">Students</span>
          <span className="stat-value">{students.length}</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-label">Tests published</span>
          <span className="stat-value">{completed.length}</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-label">Submissions</span>
          <span className="stat-value">{stats?.totalSubmissions ?? submissions.length}</span>
        </div>
      </div>

      <div className="dash-two-col">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h3>Recent test reports</h3>
            <Link href="/school/reports">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Teacher</th>
                  <th>Class</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 6).map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.title}</strong><br /><span className="text-muted">{a.subject}</span></td>
                    <td>{a.teacherName ?? '—'}</td>
                    <td>{a.className}</td>
                    <td>{stats?.byAssignment?.[a._id]?.submitted ?? 0}</td>
                  </tr>
                ))}
                {!completed.length && (
                  <tr><td colSpan={4} className="text-muted">No completed tests yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h3>Top performers</h3>
            <Link href="/school/leaderboard">Leaderboard</Link>
          </div>
          <ul className="leader-list">
            {(stats?.leaderboard ?? []).slice(0, 8).map((row, i) => (
              <li key={`${row.rollNumber}-${i}`}>
                <span className="rank">#{i + 1}</span>
                <div>
                  <strong>{row.studentName}</strong>
                  <span className="text-muted">Roll {row.rollNumber}</span>
                </div>
                <span className="score-pill">{row.score}/{row.maxScore}</span>
              </li>
            ))}
            {!stats?.leaderboard?.length && <li className="text-muted">No submissions yet</li>}
          </ul>
        </section>
      </div>

      <section className="dash-panel" style={{ marginTop: 24 }}>
        <div className="dash-panel-head">
          <h3>Teachers & students at a glance</h3>
        </div>
        <div className="dash-two-col">
          <div>
            <h4 className="sub-head">Teachers ({teachers.length})</h4>
            {teachers.map((t) => (
              <div key={t.id} className="mini-user-row">
                <span className="profile-avatar">{t.name.charAt(0)}</span>
                <div><strong>{t.name}</strong><br /><span className="text-muted">{t.email}</span></div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="sub-head">Students ({students.length})</h4>
            {students.slice(0, 8).map((s) => (
              <div key={s.id} className="mini-user-row">
                <span className="profile-avatar">{s.name.charAt(0)}</span>
                <div><strong>{s.name}</strong><br /><span className="text-muted">{s.className} · Roll {s.rollNumber}</span></div>
              </div>
            ))}
            <Link href="/school/students" className="auth-link-sm">View all students →</Link>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
