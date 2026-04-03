'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We sent a link to <strong className="text-foreground">{email}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to complete your sign up.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Join the Where in Maginhawa community
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Magic Link (primary) */}
        <form onSubmit={handleMagicLink} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full gap-2 rounded-full" disabled={loading}>
            <Mail className="w-4 h-4" />
            {loading && !showPassword ? 'Sending link...' : 'Sign Up with Magic Link'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or set a password</span>
          </div>
        </div>

        {/* Password signup (secondary) */}
        {showPassword ? (
          <form onSubmit={handlePasswordSignup} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <Button type="submit" variant="outline" className="w-full rounded-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up with Password'}
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => setShowPassword(true)}
          >
            Sign up with password instead <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
