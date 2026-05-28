'use client';

import { useEffect } from 'react';
import { PortalShell } from '@/components/PortalShell';
import { useAuthStore } from '@/store/authStore';
import { useSubmissionStore } from '@/store/submissionStore';

export default function SchoolLeaderboardPage() {
  const user = useAuthStore((s) => s.user);
  const { stats, fetchSchoolStats } = useSubmissionStore();

  useEffect(() => {
    if (user?.schoolCode) fetchSchoolStats(user.schoolCode);
  }, [user?.schoolCode, fetchSchoolStats]);

  const board = stats?.leaderboard ?? [];

  return (
    <PortalShell title="Leaderboard" subtitle="Top scores across all submitted tests">
      <div className="dash-panel">
        <ol className="leaderboard-full">
          {board.map((row, i) => (
            <li key={`${row.rollNumber}-${i}`} className={i < 3 ? `podium rank-${i + 1}` : ''}>
              <span className="rank-lg">{i + 1}</span>
              <div className="lb-user">
                <strong>{row.studentName}</strong>
                <span className="text-muted">Roll {row.rollNumber}</span>
              </div>
              <div className="lb-score">
                <span className="score-pill large">{row.score} / {row.maxScore}</span>
                <span className="text-muted">{Math.round((row.score / row.maxScore) * 100)}%</span>
              </div>
            </li>
          ))}
          {!board.length && <p className="text-muted" style={{ padding: 24 }}>No submissions yet to rank.</p>}
        </ol>
      </div>
    </PortalShell>
  );
}
