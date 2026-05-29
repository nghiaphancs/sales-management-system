'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';

export default function AgenciesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', creditLimit: '', salesId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'LEADER';

  const loadAgencies = () => {
    setLoading(true);
    api.getAgencies().then(setAgencies).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const openCreate = async () => {
    setError('');
    setForm({ name: '', phone: '', address: '', creditLimit: '', salesId: '' });
    if (canCreate) {
      try {
        const users = await api.getUsers('SALES');
        setSalesList(users);
        if (users.length === 1) setForm((f) => ({ ...f, salesId: users[0].id }));
      } catch {
        setSalesList([]);
      }
    }
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const code = `DL-${Date.now().toString().slice(-8)}`;
      await api.createAgency({
        code,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        creditLimit: Number(form.creditLimit) || 0,
        salesId: form.salesId,
      });
      setShowCreate(false);
      loadAgencies();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo đại lý');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quản lý Đại Lý</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Danh sách các cửa hàng và đại lý đang chăm sóc.</p>
        </div>
        {canCreate && (
          <button type="button" className="btn-primary" onClick={openCreate}>+ Thêm Đại Lý</button>
        )}
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Đại Lý</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Liên Hệ</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Hạn Mức Nợ</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Dư Nợ Hiện Tại</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải...</td></tr>
              ) : agencies.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không có dữ liệu đại lý.</td></tr>
              ) : (
                agencies.map((agency: any) => (
                  <tr key={agency.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{agency.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Mã: {agency.code}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div>{agency.phone}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agency.address}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#10b981', fontWeight: 600 }}>{formatMoney(agency.creditLimit)}</td>
                    <td style={{ padding: '16px 24px', color: Number(agency.currentDebt) > Number(agency.creditLimit) * 0.8 ? '#ef4444' : '#fbbf24', fontWeight: 600 }}>
                      {formatMoney(agency.currentDebt)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${agency.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {agency.isActive ? 'Hoạt Động' : 'Ngưng'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => router.push(`/dashboard/agencies/${agency.id}`)}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Thêm đại lý mới" wide>
        <form onSubmit={handleCreate}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label className="form-label">Tên đại lý *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cửa hàng ABC" />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại *</label>
            <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ *</label>
            <input className="input" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Nguyễn Huệ, Q.1" />
          </div>
          <div className="form-group">
            <label className="form-label">Hạn mức nợ (VND)</label>
            <input className="input" type="number" min={0} value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="50000000" />
          </div>
          <div className="form-group">
            <label className="form-label">Sales phụ trách *</label>
            <select className="input" required value={form.salesId} onChange={(e) => setForm({ ...form, salesId: e.target.value })}>
              <option value="">-- Chọn sales --</option>
              {salesList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Tạo đại lý'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
