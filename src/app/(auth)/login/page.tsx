'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successful login
      router.refresh();
      
      // Determine redirection path
      const role = data.user?.role;
      const redirectParam = searchParams.get('redirect');
      
      if (redirectParam) {
        router.push(redirectParam);
      } else if (role === 'applicant') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('A system error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '20px' }}>
      <div className="form-card" style={{ margin: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div className="logo-icon" style={{ width: '36px', height: '36px', fontSize: '16px' }}>B</div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>BORABU TTC</span>
          </Link>
        </div>

        <h1 className="form-title">Account Login</h1>
        <p className="form-subtitle">Access your application dashboard or admin panel.</p>

        {error && (
          <div className="alert alert-danger" style={{ padding: '12px 16px', fontSize: '13px' }}>
            <div>⚠️ {error}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="Enter your registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-light)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="form-link">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ color: 'var(--text-light)', fontSize: '16px' }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

