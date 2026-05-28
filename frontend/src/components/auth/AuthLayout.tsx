'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { UserRole } from '@/store/authStore';

const ROLE_COPY: Record<UserRole, { title: string; points: string[] }> = {
  school: {
    title: 'Complete visibility across your institution',
    points: [
      'Every teacher, student & test in one dashboard',
      'Submission reports & class-wise analytics',
      'Leaderboards and assignment performance',
    ],
  },
  teacher: {
    title: 'Create AI papers & track who submitted',
    points: [
      'Generate structured question papers in seconds',
      'See submission insights per assignment',
      'No full school dashboard — focused on your classes',
    ],
  },
  student: {
    title: 'Attempt tests assigned to your class',
    points: [
      'View published assignments only',
      'Submit answers online before due date',
      'Clean exam-style interface on any device',
    ],
  },
};

export function AuthLayout({
  role,
  children,
  footer,
}: {
  role: UserRole;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const copy = ROLE_COPY[role];

  return (
    <div className="auth-premium-page">
      <div className="auth-mesh" aria-hidden>
        <div className="auth-orb-3" aria-hidden />
      </div>
      <div className="auth-grid-overlay" aria-hidden />
      <div className="auth-premium-grid">
        <aside className="auth-showcase">
          <Logo href="/login" />
          <div className="auth-showcase-badge">{role === 'school' ? 'School Portal' : role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}</div>
          <h1>{copy.title}</h1>
          <ul>
            {copy.points.map((p) => (
              <li key={p}>
                <span className="auth-check">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="auth-stats-row">
            <div><strong>500+</strong><span>Schools</span></div>
            <div><strong>12k</strong><span>Teachers</span></div>
            <div><strong>2M</strong><span>Tests taken</span></div>
          </div>
        </aside>
        <main className="auth-form-panel">
          <div className="auth-glass-card">
            {children}
            {footer}
          </div>
          <p className="auth-legal">
            By continuing you agree to QuestAI Terms & Privacy Policy
          </p>
        </main>
      </div>
    </div>
  );
}

export function RoleTabs({
  value,
  onChange,
  mode,
}: {
  value: UserRole;
  onChange: (r: UserRole) => void;
  mode: 'login' | 'signup';
}) {
  const roles: { id: UserRole; label: string; icon: string }[] = [
    { id: 'school', label: 'School', icon: '🏫' },
    { id: 'teacher', label: 'Teacher', icon: '👩‍🏫' },
    { id: 'student', label: 'Student', icon: '🎓' },
  ];

  return (
    <div className="role-tabs">
      {roles.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`role-tab ${value === r.id ? 'role-tab-active' : ''}`}
          onClick={() => onChange(r.id)}
        >
          <span className="role-tab-icon">{r.icon}</span>
          <span>{r.label}</span>
        </button>
      ))}
      <p className="role-tab-hint">
        {mode === 'login' ? 'Sign in as' : 'Register as'} <strong>{value}</strong>
      </p>
    </div>
  );
}

export function AuthLinkFooter({ mode, role }: { mode: 'login' | 'signup'; role: UserRole }) {
  if (mode === 'login') {
    return (
      <p className="auth-footer-link">
        New to QuestAI?{' '}
        <Link href={`/signup?role=${role}`}>Create {role} account</Link>
      </p>
    );
  }
  return (
    <p className="auth-footer-link">
      Already registered? <Link href={`/login?role=${role}`}>Sign in</Link>
    </p>
  );
}
