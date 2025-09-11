
'use client';
import * as React from 'react';
import type { AdminUser } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AdminContext } from '@/contexts/AdminContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

const SESSION_KEY = 'trimology.session';

function getInitialSession(): { user: AdminUser | null, loggedIn: boolean } {
    if (typeof window === 'undefined') {
        return { user: null, loggedIn: false };
    }
    try {
        const item = window.localStorage.getItem(SESSION_KEY);
        if (item) {
            const session = JSON.parse(item);
            if (session.user && session.loggedIn) {
                return session;
            }
        }
    } catch (error) {
        console.error("Failed to parse session from localStorage", error);
    }
    return { user: null, loggedIn: false };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [adminUser, setAdminUser] = React.useState<AdminUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const session = getInitialSession();
        setAdminUser(session.user);
        setLoading(false);
    }, []);

    const login = (user: AdminUser) => {
        const newSession = { user, loggedIn: true };
        try {
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        } catch (error) {
            console.error("Failed to save session to localStorage", error);
        }
        setAdminUser(user);

        // Redirect based on role after login
        if (user.email.includes('staff')) {
            router.push('/staff/my-schedule');
        } else {
            router.push('/admin');
        }
    };

    const logout = () => {
        try {
            window.localStorage.removeItem(SESSION_KEY);
        } catch (error) {
            console.error("Failed to remove session from localStorage", error);
        }
        setAdminUser(null);
        router.push('/');
    };

    const getSession = () => {
        return getInitialSession();
    };
    
    const contextValue = { adminUser, loading, login, logout, getSession };

    // Allow access to login pages even if not authenticated
    const isLoginPage = pathname === '/admin' || pathname === '/staff/login';
    const isMySchedulePage = pathname === '/staff/my-schedule';

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!adminUser && !isLoginPage) {
        // Special case for my-schedule page to prevent flash of access denied
        if (isMySchedulePage) {
             // Let the page handle the redirect, as it has more context
             return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
        }

        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-center p-4">
                <div>
                    <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">You must be logged in to view this page.</p>
                    <Button asChild>
                        <Link href="/admin">Return to Login</Link>
                    </Button>
                </div>
            </div>
        );
    }
  
    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
}
