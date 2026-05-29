'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMoney, formatDate, ORDER_STATUS_LABEL } from '@/lib/format';
import { Modal } from '@/components/Modal';

type OrderLine = { productId: string; quantity: string };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [agencyId, setAgencyId] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([{ productId: '', quantity: '1' }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    api.getOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openCreate = async () => {
    setError('');
    setAgencyId('');
    setLines([{ productId: '', quantity: '1' }]);
    try {
      const [a, p] = await Promise.all([api.getAgencies(), api.getProducts()]);
      setAgencies(a);
      setProducts(p);
    } catch {
      setAgencies([]);
      setProducts([]);
    }
    setShowCreate(true);
  };

  const addLine = () => setLines([...lines, { productId: '', quantity: '1' }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const items = lines
      .filter((l) => l.productId && Number(l.quantity) > 0)
      .map((l) => ({ productId: l.productId, quantity: Number(l.quantity) }));
    if (!agencyId) {
      setError('Vui lòng chọn đại lý');
      return;
    }
    if (items.length === 0) {
      setError('Thêm ít nhất một sản phẩm');
      return;
    }
    setSubmitting(true);
    try {
      await api.createOrder({ agencyId, items });
      setShowCreate(false);
      loadOrders();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'DELIVERED') return 'badge-success';
    if (status === 'CANCELED') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quản lý Đơn Hàng</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Lịch sử và trạng thái các đơn đặt hàng.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>+ Tạo Đơn Hàng Mới</button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Mã Đơn</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Đại Lý</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Sales</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Tổng Tiền</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Ngày Tạo</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không có đơn hàng nào.</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{order.code}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ color: '#fff' }}>{order.agency.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{order.agency.code}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{order.sales?.name || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#06b6d4' }}>{formatMoney(order.totalAmount)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${statusBadge(order.status)}`}>
                        {ORDER_STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => router.push(`/dashboard/orders/${order.id}`)}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tạo đơn hàng mới" wide>
        <form onSubmit={handleCreate}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label className="form-label">Đại lý *</label>
            <select className="input" required value={agencyId} onChange={(e) => setAgencyId(e.target.value)}>
              <option value="">-- Chọn đại lý --</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
          <p className="form-label" style={{ marginBottom: 8 }}>Sản phẩm *</p>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 40px', gap: 8, marginBottom: 8 }}>
              <select
                className="input"
                required
                value={line.productId}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].productId = e.target.value;
                  setLines(next);
                }}
              >
                <option value="">-- Sản phẩm --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.price)}</option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min={1}
                required
                value={line.quantity}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].quantity = e.target.value;
                  setLines(next);
                }}
                placeholder="SL"
              />
              {lines.length > 1 && (
                <button type="button" className="btn-ghost" onClick={() => removeLine(i)} style={{ padding: 0 }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-ghost" style={{ marginBottom: 16, fontSize: 13 }} onClick={addLine}>+ Thêm dòng</button>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang tạo...' : 'Tạo đơn'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
