
'use client';
import * as React from 'react';
import type { AdminUser } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AdminContext } from '@/contexts/AdminContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

// This is a simple in-memory session store.
// In a real app, this would be managed by a library like next-auth or by httpOnly cookies.
let memorySession: { user: AdminUser | null, loggedIn: boolean } = { user: null, loggedIn: false };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(memorySession.user);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = (user: AdminUser) => {
    memorySession = { user, loggedIn: true };
    setAdminUser(user);
    if (user.email.includes('staff')) {
        router.push('/staff/my-schedule');
    } else {
        router.push('/admin');
    }
  };

  const logout = () => {
    memorySession = { user: null, loggedIn: false };
    setAdminUser(null);
    router.push('/');
  };

  const getSession = () => memorySession;

  React.useEffect(() => {
    setAdminUser(memorySession.user);
    setLoading(false);
  }, [pathname]);

  const contextValue = { adminUser, loading, login, logout, getSession };

  // Allow access to login pages even if not authenticated
  const isLoginPage = pathname === '/admin' || pathname === '/staff/login';

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminUser && !isLoginPage) {
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
