import AdminLayout from '@/app/admin/layout';
import * as React from 'react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
