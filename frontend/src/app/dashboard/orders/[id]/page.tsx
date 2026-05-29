'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMoney, formatDate, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/format';
import { BackLink } from '@/components/BackLink';
import { DetailRow } from '@/components/DetailRow';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(id)
      .then(setOrder)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ color: 'var(--color-text-muted)' }}>Đang tải...</div>;

  if (error || !order) {
    return (
      <div>
        <BackLink href="/dashboard/orders" />
        <p className="form-error">{error || 'Không tìm thấy đơn hàng'}</p>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    if (status === 'DELIVERED') return 'badge-success';
    if (status === 'CANCELED') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <div className="animate-in">
      <BackLink href="/dashboard/orders" />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{order.code}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Chi tiết đơn hàng</p>

      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <DetailRow label="Đại lý" value={`${order.agency?.name} (${order.agency?.code})`} />
        <DetailRow label="Sales" value={order.sales?.name || '—'} />
        <DetailRow label="Tổng tiền" value={<span style={{ color: '#06b6d4', fontWeight: 700 }}>{formatMoney(order.totalAmount)}</span>} />
        <DetailRow label="Trạng thái đơn" value={
          <span className={`badge ${statusBadge(order.status)}`}>{ORDER_STATUS_LABEL[order.status] || order.status}</span>
        } />
        <DetailRow label="Thanh toán" value={
          <span className="badge badge-info">{PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus}</span>
        } />
        <DetailRow label="Ngày tạo" value={formatDate(order.createdAt)} />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Chi tiết sản phẩm</h2>
      <div className="glass" style={{ overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.05)', color: 'var(--color-text-muted)', fontSize: 13 }}>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>Sản phẩm</th>
              <th style={{ padding: '14px 20px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>SL</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Đơn giá</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item: any) => (
              <tr key={item.id} className="table-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 20px' }}>{item.product?.name}</td>
                <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{item.product?.sku}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>{formatMoney(item.unitPrice)}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.subTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(order.payments?.length ?? 0) > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Thanh toán liên quan</h2>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.05)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>Mã phiếu</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Số tiền</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map((p: any) => (
                  <tr key={p.id} className="table-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 20px' }}>{p.code}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', color: '#10b981' }}>{formatMoney(p.amount)}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
