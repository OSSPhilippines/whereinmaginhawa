import { BadgeCheck } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
      <BadgeCheck className="w-3.5 h-3.5" />
      Verified Owner
    </span>
  );
}
