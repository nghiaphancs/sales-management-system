'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { BackLink } from '@/components/BackLink';
import { DetailRow } from '@/components/DetailRow';

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUser(id)
      .then(setUser)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const roleLabel: Record<string, { text: string; cls: string }> = {
    ADMIN: { text: 'Admin', cls: 'badge-danger' },
    LEADER: { text: 'Leader', cls: 'badge-warning' },
    SALES: { text: 'Sales', cls: 'badge-info' },
  };

  if (loading) return <div style={{ color: 'var(--color-text-muted)' }}>Đang tải...</div>;

  if (error || !user) {
    return (
      <div>
        <BackLink href="/dashboard/users" />
        <p className="form-error">{error || 'Không tìm thấy nhân viên'}</p>
      </div>
    );
  }

  const role = roleLabel[user.role] || { text: user.role, cls: 'badge' };

  return (
    <div className="animate-in">
      <BackLink href="/dashboard/users" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)', fontWeight: 700, fontSize: 22, color: '#fff',
        }}>
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{user.name}</h1>
          <span className={`badge ${role.cls}`} style={{ marginTop: 8 }}>{role.text}</span>
        </div>
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Số điện thoại" value={user.phone || '—'} />
        <DetailRow label="Leader" value={user.leader?.name || '—'} />
        <DetailRow label="Số đại lý" value={user._count?.agencies ?? 0} />
        <DetailRow label="Số đơn hàng" value={user._count?.orders ?? 0} />
        <DetailRow label="Trạng thái" value={
          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
            {user.isActive ? 'Đang làm việc' : 'Đã nghỉ'}
          </span>
        } />
        <DetailRow label="Ngày tham gia" value={formatDate(user.createdAt)} />
      </div>
    </div>
  );
}
