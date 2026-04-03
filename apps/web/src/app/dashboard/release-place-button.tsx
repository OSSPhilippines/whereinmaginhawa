'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { csrfFetch } from '@/lib/csrf-client';

interface ReleasePlaceButtonProps {
  placeId: string;
  placeName: string;
}

export function ReleasePlaceButton({ placeId, placeName }: ReleasePlaceButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [releasing, setReleasing] = useState(false);

  async function handleRelease() {
    setReleasing(true);

    try {
      const response = await csrfFetch(`/api/owner/places/${placeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error('Failed to release place', {
          description: data.error || 'Please try again.',
        });
        setReleasing(false);
        setConfirming(false);
        return;
      }

      toast.success(`Released "${placeName}"`, {
        description: 'The place is now available for others to claim.',
      });

      router.refresh();
    } catch {
      toast.error('Something went wrong');
      setReleasing(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="destructive"
          disabled={releasing}
          onClick={handleRelease}
          className="text-xs"
        >
          {releasing ? 'Releasing...' : 'Confirm'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={releasing}
          onClick={() => setConfirming(false)}
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setConfirming(true)}
      className="gap-1.5 text-muted-foreground hover:text-destructive"
    >
      <Unlink className="w-3.5 h-3.5" />
      Release
    </Button>
  );
}
