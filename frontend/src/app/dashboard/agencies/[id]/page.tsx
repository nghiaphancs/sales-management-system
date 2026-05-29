'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMoney, formatDate } from '@/lib/format';
import { BackLink } from '@/components/BackLink';
import { DetailRow } from '@/components/DetailRow';
import { Modal } from '@/components/Modal';

export default function AgencyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agency, setAgency] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'BANK_TRANSFER', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.getAgency(id), api.getPayments(id)])
      .then(([a, p]) => {
        setAgency(a);
        setPayments(p);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPayment({
        agencyId: id,
        amount: Number(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        notes: payForm.notes || undefined,
      });
      setShowPayment(false);
      setPayForm({ amount: '', paymentMethod: 'BANK_TRANSFER', notes: '' });
      load();
    } catch (err: any) {
      alert(err.message || 'Không thể ghi nhận thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Đang tải...</div>;
  }

  if (error || !agency) {
    return (
      <div>
        <BackLink href="/dashboard/agencies" />
        <p className="form-error">{error || 'Không tìm thấy đại lý'}</p>
      </div>
    );
  }

  const debtRatio = Number(agency.creditLimit) > 0
    ? (Number(agency.currentDebt) / Number(agency.creditLimit)) * 100
    : 0;

  return (
    <div className="animate-in">
      <BackLink href="/dashboard/agencies" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{agency.name}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Mã: {agency.code}</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowPayment(true)}>+ Ghi nhận thanh toán</button>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <DetailRow label="Số điện thoại" value={agency.phone} />
        <DetailRow label="Địa chỉ" value={agency.address} />
        <DetailRow label="Sales phụ trách" value={agency.sales?.name || '—'} />
        <DetailRow label="Email sales" value={agency.sales?.email || '—'} />
        <DetailRow label="Hạn mức nợ" value={<span style={{ color: '#10b981', fontWeight: 600 }}>{formatMoney(agency.creditLimit)}</span>} />
        <DetailRow label="Dư nợ hiện tại" value={<span style={{ color: debtRatio > 80 ? '#ef4444' : '#fbbf24', fontWeight: 600 }}>{formatMoney(agency.currentDebt)} ({debtRatio.toFixed(0)}%)</span>} />
        <DetailRow label="Trạng thái" value={
          <span className={`badge ${agency.isActive ? 'badge-success' : 'badge-danger'}`}>
            {agency.isActive ? 'Hoạt động' : 'Ngưng'}
          </span>
        } />
        <DetailRow label="Ngày tạo" value={formatDate(agency.createdAt)} />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lịch sử thanh toán</h2>
      <div className="glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.05)', color: 'var(--color-text-muted)', fontSize: 13 }}>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>Mã phiếu</th>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>Số tiền</th>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>Hình thức</th>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có thanh toán</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="table-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 20px' }}>{p.code}</td>
                  <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 600 }}>{formatMoney(p.amount)}</td>
                  <td style={{ padding: '14px 20px' }}>{p.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{formatDate(p.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Ghi nhận thanh toán">
        <form onSubmit={handlePayment}>
          <div className="form-group">
            <label className="form-label">Số tiền (VND) *</label>
            <input className="input" type="number" required min={1} max={Number(agency.currentDebt)} value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Dư nợ tối đa: {formatMoney(agency.currentDebt)}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Hình thức</label>
            <select className="input" value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CASH">Tiền mặt</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <input className="input" value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={() => setShowPayment(false)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Xác nhận'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
