
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { StaffLoginForm } from '@/components/staff-login-form';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export default function StaffLoginPage() {
  const router = useRouter();
  const { adminUser, loading } = useAdmin();

  React.useEffect(() => {
    if (!loading && adminUser) {
        router.push('/my-schedule');
    }
  }, [adminUser, loading, router]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Render login form if not loading and no user
  return <StaffLoginForm />;
}
