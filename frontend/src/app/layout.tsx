import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

export const metadata = {
  title: 'AuraSales | Premium Sales Management',
  description: 'Hệ thống quản lý bán hàng và đại lý chuyên nghiệp',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
