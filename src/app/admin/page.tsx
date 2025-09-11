
'use client';

import * as React from 'react';
import { AdminLoginForm } from '@/components/admin-login-form';
import { AdminDashboard } from '@/components/admin-dashboard';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { adminUser, loading } = useAdmin();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && adminUser) {
           if (adminUser.email.includes('staff')) {
                router.push('/staff/my-schedule');
           }
        }
    }, [adminUser, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (adminUser) {
        // Prevent staff from accessing the admin dashboard
        if (adminUser.email.includes('staff')) {
            return null; // or a loading indicator while redirecting
        }
        return <AdminDashboard user={adminUser} adminUser={adminUser} />;
    }

    return <AdminLoginForm />;
}
