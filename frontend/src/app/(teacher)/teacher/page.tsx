'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { IconSearch, IconFilter, IconMore } from '@/components/icons';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSubmissionStore } from '@/store/submissionStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import { Assignment } from '@/types';

export default function TeacherAssignmentsPage() {
  useWebSocket();
  const user = useAuthStore((s) => s.user);
  const { assignments, isLoading, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const { submissions, fetchSubmissions } = useSubmissionStore();
  const [search, setSearch] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments({ teacherId: user.id });
      fetchSubmissions({ teacherId: user.id });
    }
  }, [user?.id, fetchAssignments, fetchSubmissions]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase())
  );

  const submissionCount = (id: string) => submissions.filter((s) => s.assignmentId === id).length;

  return (
    <PortalShell title="Assignments" subtitle="Create tests and view who submitted — no full school dashboard.">
      <div className="filter-bar">
        <button type="button" className="filter-btn"><IconFilter /> Filter By</button>
        <div className="search-wrap">
          <IconSearch />
          <input type="search" placeholder="Search Assignment" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: 48 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">📝</div>
          <h2>No assignments yet</h2>
          <p>Create your first AI-generated test for your class.</p>
          <Link href="/teacher/new" className="btn-dark">+ Create Your First Assignment</Link>
        </div>
      ) : (
        <div className="assignment-grid">
          {filtered.map((a) => (
            <article key={a._id} className="assignment-card">
              <button type="button" className="card-menu-btn" onClick={() => setMenuId(menuId === a._id ? null : a._id)}><IconMore /></button>
              {menuId === a._id && (
                <div className="card-menu">
                  <Link href={`/teacher/${a._id}`} onClick={() => setMenuId(null)}>View paper</Link>
                  <Link href={`/teacher/insights/${a._id}`} onClick={() => setMenuId(null)}>Submission insights</Link>
                  <button type="button" className="danger" onClick={() => { deleteAssignment(a._id); setMenuId(null); }}>Delete</button>
                </div>
              )}
              <h3>{a.title}</h3>
              <div className="assignment-card-meta">
                <div>Due: {format(new Date(a.dueDate), 'dd-MM-yyyy')}</div>
                <div>Submissions: <strong>{submissionCount(a._id)}</strong></div>
                <span className={`badge-status status-${a.status}`}>{a.status}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link href="/teacher/new" className="btn-orange-fab">+</Link>
    </PortalShell>
  );
}
