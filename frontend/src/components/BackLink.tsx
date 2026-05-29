'use client';
import Link from 'next/link';

export function BackLink({ href, label = 'Quay lại danh sách' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="btn-ghost"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none', fontSize: 14 }}
    >
      ← {label}
    </Link>
  );
}
