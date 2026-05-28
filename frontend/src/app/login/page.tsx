'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout, RoleTabs, AuthLinkFooter } from '@/components/auth/AuthLayout';
import { Logo } from '@/components/Logo';
import { useAuthStore, UserRole } from '@/store/authStore';
import { homeForRole } from '@/lib/rolePaths';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role') as UserRole;
    if (r && ['school', 'teacher', 'student'].includes(r)) setRole(r);
  }, [searchParams]);

  useEffect(() => {
    if (role === 'school') setEmail('school@dpsbokaro.edu');
    else if (role === 'teacher') setEmail('teacher@dpsbokaro.edu');
    else setEmail('student@dpsbokaro.edu');
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password, role);
    setLoading(false);
    if (!ok) {
      setError(`Invalid credentials for ${role} account. Try demo password: demo123`);
      return;
    }
    const redirect = searchParams.get('redirect');
    const home = homeForRole(role);
    router.push(redirect && redirect.startsWith('/') ? redirect : home);
  };

  return (
    <AuthLayout role={role} footer={<AuthLinkFooter mode="login" role={role} />}>
      <div className="auth-card-head">
        <Logo href="/login" size="sm" />
        <h2>Welcome back</h2>
        <p>Sign in to your QuestAI portal</p>
      </div>

      <RoleTabs value={role} onChange={setRole} mode="login" />

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input-field auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              role === 'student' ? 'student@school.edu' : role === 'school' ? 'admin@school.edu' : 'teacher@school.edu'
            }
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="input-field auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="auth-row-between">
          <label className="auth-remember">
            <input type="checkbox" /> Remember me
          </label>
          <Link href="#" className="auth-link-sm">Forgot password?</Link>
        </div>

        <button type="submit" className="btn-auth-primary" disabled={loading}>
          {loading ? (
            <span className="btn-loading"><span className="auth-spinner sm" /> Signing in...</span>
          ) : (
            `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
          )}
        </button>

        <div className="auth-divider">or continue with</div>

        <div className="auth-social-row">
          <button type="button" className="btn-social" onClick={() => setError('Google SSO coming soon')}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button type="button" className="btn-social" onClick={() => setError('Microsoft SSO coming soon')}>
            Microsoft
          </button>
        </div>

        <div className="auth-demo-box">
          <p><strong>Demo accounts</strong> (password: <code>demo123</code>)</p>
          <button type="button" onClick={() => { setRole('school'); setEmail('school@dpsbokaro.edu'); }}>School</button>
          <button type="button" onClick={() => { setRole('teacher'); setEmail('teacher@dpsbokaro.edu'); }}>Teacher</button>
          <button type="button" onClick={() => { setRole('student'); setEmail('student@dpsbokaro.edu'); }}>Student</button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
