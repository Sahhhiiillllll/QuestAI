'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout, RoleTabs, AuthLinkFooter } from '@/components/auth/AuthLayout';
import { Logo } from '@/components/Logo';
import { useAuthStore, UserRole } from '@/store/authStore';
import { homeForRole } from '@/lib/rolePaths';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signup = useAuthStore((s) => s.signup);
  const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'teacher');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('Delhi Public School, Bokaro Steel City');
  const [schoolCode, setSchoolCode] = useState('DPS-BOK');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('Class 8');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role') as UserRole;
    if (r && ['school', 'teacher', 'student'].includes(r)) setRole(r);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (role === 'student' && (!rollNumber.trim() || !className.trim())) {
      setError('Roll number and class are required for students');
      return;
    }
    setLoading(true);
    const err = await signup({
      name,
      email,
      password,
      schoolName,
      schoolCode,
      role,
      rollNumber: role === 'student' ? rollNumber : undefined,
      className: role === 'student' ? className : undefined,
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push(homeForRole(role));
  };

  return (
    <AuthLayout role={role} footer={<AuthLinkFooter mode="signup" role={role} />}>
      <div className="auth-card-head">
        <Logo href="/signup" size="sm" />
        <h2>Create your account</h2>
        <p>Join QuestAI as {role === 'school' ? 'an institution' : role === 'teacher' ? 'a teacher' : 'a student'}</p>
      </div>

      <RoleTabs value={role} onChange={setRole} mode="signup" />

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label>Full name</label>
          <input className="input-field auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input type="email" className="input-field auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="auth-field-grid">
          <div className="auth-field">
            <label>School name</label>
            <input className="input-field auth-input" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required disabled={role !== 'school'} />
          </div>
          <div className="auth-field">
            <label>School code</label>
            <input className="input-field auth-input" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} placeholder="DPS-BOK" required />
          </div>
        </div>

        {role === 'student' && (
          <div className="auth-field-grid">
            <div className="auth-field">
              <label>Roll number</label>
              <input className="input-field auth-input" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="24" required />
            </div>
            <div className="auth-field">
              <label>Class / Grade</label>
              <input className="input-field auth-input" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class 8" required />
            </div>
          </div>
        )}

        {role === 'teacher' && (
          <p className="auth-hint">Use the school code provided by your institution admin.</p>
        )}

        <div className="auth-field">
          <label>Password</label>
          <input type="password" className="input-field auth-input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </div>

        <button type="submit" className="btn-auth-primary" disabled={loading}>
          {loading ? 'Creating account...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-spinner" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
