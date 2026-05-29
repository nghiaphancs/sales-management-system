'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { DetailRow } from '@/components/DetailRow';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [form, setForm] = useState({ sku: '', name: '', price: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    api.getProducts().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createProduct({
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
      });
      setShowCreate(false);
      setForm({ sku: '', name: '', price: '' });
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Sản Phẩm</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Quản lý danh mục hàng hóa của hệ thống.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setError(''); setShowCreate(true); }}>+ Thêm Sản Phẩm</button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Sản Phẩm</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Giá Bán</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có sản phẩm nào.</td></tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>SKU: {product.sku}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#10b981' }}>{formatMoney(product.price)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {product.isActive ? 'Đang bán' : 'Ngưng bán'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setDetail(product)}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Thêm sản phẩm mới">
        <form onSubmit={handleCreate}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input className="input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SP-001" />
          </div>
          <div className="form-group">
            <label className="form-label">Tên sản phẩm *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Giá bán (VND) *</label>
            <input className="input" type="number" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Tạo sản phẩm'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Chi tiết sản phẩm">
        {detail && (
          <div>
            <DetailRow label="Tên" value={detail.name} />
            <DetailRow label="SKU" value={detail.sku} />
            <DetailRow label="Giá bán" value={<span style={{ color: '#10b981', fontWeight: 600 }}>{formatMoney(detail.price)}</span>} />
            <DetailRow label="Trạng thái" value={
              <span className={`badge ${detail.isActive ? 'badge-success' : 'badge-danger'}`}>
                {detail.isActive ? 'Đang bán' : 'Ngưng bán'}
              </span>
            } />
          </div>
        )}
      </Modal>
    </div>
  );
}
