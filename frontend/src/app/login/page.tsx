'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds: Record<string, { email: string; pass: string }> = {
      admin: { email: 'admin@aurasales.vn', pass: 'admin123' },
      leader: { email: 'leader1@aurasales.vn', pass: 'leader123' },
      sales: { email: 'sales.a@aurasales.vn', pass: 'sales123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background gradient orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass animate-in" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>AuraSales</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>Hệ thống quản lý bán hàng & đại lý</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Mật khẩu</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(99,102,241,0.15)' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 10 }}>Demo accounts – click để điền nhanh</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={() => fillDemo('admin')} style={{ fontSize: 12 }}>👑 Admin</button>
            <button className="btn-ghost" onClick={() => fillDemo('leader')} style={{ fontSize: 12 }}>🎯 Leader</button>
            <button className="btn-ghost" onClick={() => fillDemo('sales')} style={{ fontSize: 12 }}>💼 Sales</button>
          </div>
        </div>
      </div>
    </div>
  );
}
