
'use client';
import * as React from 'react';
import type { AdminUser } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AdminContext } from '@/contexts/AdminContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { getAdminUserByEmail } from '@/lib/data';

// Store session in memory for simplicity
let memorySession: { user: AdminUser | null, loggedIn: boolean } = { user: null, loggedIn: false };

export const login = (user: AdminUser) => {
    memorySession = { user, loggedIn: true };
};

export const logout = () => {
    memorySession = { user: null, loggedIn: false };
};

export const getSession = () => memorySession;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const session = getSession();
    if (session.loggedIn && session.user) {
        setAdminUser(session.user);
    } else {
        setAdminUser(null);
    }
    setLoading(false);
  }, [pathname]);

  const contextValue = { adminUser, loading, login, logout, getSession };

  // Allow access to login page even if not authenticated
  if (pathname === '/admin' || pathname === '/staff/login') {
      return (
          <AdminContext.Provider value={contextValue}>
              {children}
          </AdminContext.Provider>
      );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminUser) {
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
