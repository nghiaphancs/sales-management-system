'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="gradient-text" style={{ fontSize: 18, fontWeight: 500 }}>Đang tải dữ liệu Dashboard...</div>;
  if (error) return <div style={{ color: '#ef4444' }}>Lỗi: {error}</div>;
  if (!data) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const { stats, recentOrders } = data;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tổng quan {user?.role === 'ADMIN' ? 'Hệ thống' : user?.role === 'LEADER' ? 'Đội nhóm' : 'Cá nhân'}</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Cập nhật thống kê mới nhất tính đến thời điểm hiện tại.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="glass stat-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>Tổng Doanh Thu</span>
            <span style={{ fontSize: 20, background: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8 }}>💰</span>
          </div>
          <div className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>
            {formatMoney(stats.totalRevenue || stats.teamRevenue || stats.myRevenue || 0)}
          </div>
        </div>

        <div className="glass stat-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>Đại Lý Đang Chăm Sóc</span>
            <span style={{ fontSize: 20, background: 'rgba(99, 102, 241, 0.1)', padding: 8, borderRadius: 8 }}>🏪</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {stats.totalAgencies || stats.teamAgencies || stats.myAgencies || 0}
          </div>
        </div>

        <div className="glass stat-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>Đơn Hàng Đã Đặt</span>
            <span style={{ fontSize: 20, background: 'rgba(245, 158, 11, 0.1)', padding: 8, borderRadius: 8 }}>📦</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {stats.totalOrders || stats.teamOrders || stats.myOrders || 0}
          </div>
        </div>
        
        {user?.role === 'ADMIN' && (
          <div className="glass stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>Nhân Viên Sales</span>
              <span style={{ fontSize: 20, background: 'rgba(6, 182, 212, 0.1)', padding: 8, borderRadius: 8 }}>👥</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {stats.totalSales || 0}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders Table */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="glass" style={{ padding: '24px 0', overflow: 'hidden' }}>
          <div style={{ padding: '0 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Đơn hàng gần đây</h2>
            <Link href="/dashboard/orders" style={{ color: 'var(--color-primary-light)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Xem tất cả →</Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  <th style={{ padding: '12px 24px', fontWeight: 500 }}>Mã Đơn</th>
                  <th style={{ padding: '12px 24px', fontWeight: 500 }}>Đại Lý</th>
                  <th style={{ padding: '12px 24px', fontWeight: 500 }}>Giá Trị</th>
                  <th style={{ padding: '12px 24px', fontWeight: 500 }}>Trạng Thái</th>
                  <th style={{ padding: '12px 24px', fontWeight: 500 }}>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{order.code}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500, color: '#fff' }}>{order.agency.name}</div>
                      {order.sales && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Sales: {order.sales.name}</div>}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{formatMoney(order.totalAmount)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`}>
                        {order.status === 'DELIVERED' ? 'Đã Giao' : 'Chờ Xử Lý'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
