import { ReactNode } from 'react';

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#fff' }}>{value}</span>
    </div>
  );
}
