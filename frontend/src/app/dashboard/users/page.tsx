'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/Modal';

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'SALES', leaderId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api.getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = async () => {
    setError('');
    setForm({ name: '', email: '', password: '', phone: '', role: 'SALES', leaderId: '' });
    try {
      const list = await api.getUsers('LEADER');
      setLeaders(list);
    } catch {
      setLeaders([]);
    }
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
        leaderId: form.role === 'SALES' && form.leaderId ? form.leaderId : undefined,
      });
      setShowCreate(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="badge badge-danger">Admin</span>;
      case 'LEADER': return <span className="badge badge-warning">Leader</span>;
      case 'SALES': return <span className="badge badge-info">Sales</span>;
      default: return <span className="badge">{role}</span>;
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{currentUser?.role === 'ADMIN' ? 'Quản lý Hệ thống Nhân Sự' : 'Đội ngũ Sales của tôi'}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Thông tin và trạng thái hoạt động của nhân viên.</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button type="button" className="btn-primary" onClick={openCreate}>+ Tạo Tài Khoản Mới</button>
        )}
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Tên Nhân Viên</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Liên Hệ</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Vai Trò</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Thống kê</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không có dữ liệu nhân viên.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', fontWeight: 700, fontSize: 14, color: '#fff'
                        }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                          {u.leader && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Leader: {u.leader.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div>{u.email}</div>
                      {u.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{u.phone}</div>}
                    </td>
                    <td style={{ padding: '16px 24px' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {u._count ? `${u._count.agencies} đại lý · ${u._count.orders} đơn` : '—'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Đang làm' : 'Đã nghỉ'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => router.push(`/dashboard/users/${u.id}`)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tạo tài khoản mới" wide>
        <form onSubmit={handleCreate}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label className="form-label">Họ tên *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="SALES">Sales</option>
              <option value="LEADER">Leader</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {form.role === 'SALES' && (
            <div className="form-group">
              <label className="form-label">Leader quản lý</label>
              <select className="input" value={form.leaderId} onChange={(e) => setForm({ ...form, leaderId: e.target.value })}>
                <option value="">-- Không chọn --</option>
                {leaders.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
