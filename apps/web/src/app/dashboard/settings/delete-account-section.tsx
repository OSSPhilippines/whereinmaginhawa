'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { csrfFetch } from '@/lib/csrf-client';

interface DeleteAccountSectionProps {
  email: string;
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isConfirmed = confirmText === email;

  async function handleDelete() {
    if (!isConfirmed) return;
    setDeleting(true);

    try {
      const response = await csrfFetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error('Failed to delete account', {
          description: data.error || 'Please try again or contact support.',
        });
        setDeleting(false);
        return;
      }

      // Sign out locally
      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success('Account deleted', {
        description: 'Your account has been permanently deleted.',
      });

      router.push('/');
      router.refresh();
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showConfirm ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action
              cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50"
              onClick={() => setShowConfirm(true)}
            >
              Delete my account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-1">
                This will permanently:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Delete your account and profile</li>
                <li>Remove your name from any contributions</li>
                <li>Release any business claims you hold (places will remain listed)</li>
              </ul>
            </div>

            <div>
              <label htmlFor="confirm-delete" className="text-sm font-medium text-foreground block mb-1.5">
                Type <span className="font-mono text-destructive">{email}</span> to confirm
              </label>
              <Input
                id="confirm-delete"
                type="email"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={email}
                autoComplete="off"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                disabled={!isConfirmed || deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Permanently delete account'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText('');
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
