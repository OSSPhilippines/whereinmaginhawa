'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';

interface ClaimButtonProps {
  placeSlug: string;
}

export function ClaimButton({ placeSlug }: ClaimButtonProps) {
  const { user } = useAuth();

  const href = user
    ? `/places/${placeSlug}/claim`
    : `/auth/login?redirect=${encodeURIComponent(`/places/${placeSlug}/claim`)}`;

  return (
    <Button
      variant="outline"
      size="default"
      asChild
      className="w-full gap-2 border-green-300 text-green-700 hover:border-green-500 hover:bg-green-50"
    >
      <Link href={href}>
        <BadgeCheck className="w-4 h-4" />
        Claim This Business
      </Link>
    </Button>
  );
}
