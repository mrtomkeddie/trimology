
'use client';

import * as React from 'react';
import { AdminLoginForm } from '@/components/admin-login-form';
import { AdminDashboard } from '@/components/admin-dashboard';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { adminUser, loading, getSession } = useAdmin();
    const router = useRouter();

    React.useEffect(() => {
        const session = getSession();
        if (session.loggedIn && session.user) {
            // Already logged in, do nothing, dashboard will render
        } else {
            // Not logged in
        }
    }, [adminUser, router, getSession]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (adminUser) {
        return <AdminDashboard user={adminUser} adminUser={adminUser} />;
    }

    return <AdminLoginForm />;
}
