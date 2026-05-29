'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['ADMIN', 'LEADER', 'SALES'] },
  { label: 'Đội Sales', href: '/dashboard/users', icon: '👥', roles: ['ADMIN', 'LEADER'] },
  { label: 'Đại lý', href: '/dashboard/agencies', icon: '🏪', roles: ['ADMIN', 'LEADER', 'SALES'] },
  { label: 'Đơn hàng', href: '/dashboard/orders', icon: '📦', roles: ['ADMIN', 'LEADER', 'SALES'] },
  { label: 'Sản phẩm', href: '/dashboard/products', icon: '🏷️', roles: ['ADMIN'] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="gradient-text" style={{ fontSize: 20, fontWeight: 600 }}>Đang tải...</div>
      </div>
    );
  }

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));
  const roleBadge: Record<string, { label: string; cls: string }> = {
    ADMIN: { label: 'Admin', cls: 'badge-danger' },
    LEADER: { label: 'Leader', cls: 'badge-warning' },
    SALES: { label: 'Sales', cls: 'badge-info' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass" style={{
        width: 260, padding: '24px 16px', display: 'flex', flexDirection: 'column',
        borderRadius: 0, borderRight: '1px solid rgba(99,102,241,0.12)', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <span className="gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>AuraSales</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredNav.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.1))' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.12)', paddingTop: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 8px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)', fontWeight: 700, fontSize: 14,
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.name}</div>
              <span className={`badge ${roleBadge[user.role].cls}`} style={{ fontSize: 10 }}>
                {roleBadge[user.role].label}
              </span>
            </div>
          </div>
          <button className="btn-ghost" onClick={logout} style={{ width: '100%', fontSize: 13 }}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 260, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
