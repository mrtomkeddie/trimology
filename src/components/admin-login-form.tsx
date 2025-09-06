
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { getAdminUserByEmail } from '@/lib/data';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { login } = useAdmin();
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const adminUser = await getAdminUserByEmail(email);

        if (adminUser) {
            // In a dummy data setup, we don't check the password.
            // A real implementation would verify the password hash here.
            login(adminUser);
            // The redirection is now handled inside the login function in the layout
        } else {
            toast({
                title: 'Login Failed',
                description: 'The email you entered was not found.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        toast({
            title: 'Login Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
        toast({ title: 'Error', description: 'Please enter your email address.', variant: 'destructive' });
        return;
    }
    setIsResetting(true);
    // This is a dummy implementation
    setTimeout(() => {
      toast({ title: 'Password Reset Email Sent', description: 'If this were a real app, you would have received an email!' });
      setIsResetting(false);
      document.getElementById('close-reset-dialog')?.click();
      setResetEmail('');
    }, 1000);
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-4">
             <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Dialog onOpenChange={(open) => !open && setResetEmail('')}>
                <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="w-full font-normal text-sm -mt-2">Forgot Password?</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="admin@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                           <Button variant="outline" id="close-reset-dialog">Cancel</Button>
                         </DialogClose>
                        <Button onClick={handlePasswordReset} disabled={isResetting}>
                            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors mt-2">
                &larr; Return to Home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
