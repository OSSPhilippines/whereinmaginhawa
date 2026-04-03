'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PartyPopper, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';

type SubmissionType = 'create' | 'update' | 'delete';

interface SuccessConfig {
  icon: FC<LucideProps>;
  title: string;
  description: string;
  backButtonText: string;
  backButtonPath: string;
}

const successConfigs: Record<SubmissionType, SuccessConfig> = {
  create: {
    icon: PartyPopper,
    title: 'Submission Received!',
    description: 'Thank you for contributing to Where In Maginhawa! Your submission will be reviewed and added to the directory soon.',
    backButtonText: 'Back to Home',
    backButtonPath: '/',
  },
  update: {
    icon: PartyPopper,
    title: 'Changes Submitted!',
    description: 'Thank you for helping keep the information up to date! Your suggested changes will be reviewed and applied soon.',
    backButtonText: 'Back to Places',
    backButtonPath: '/places',
  },
  delete: {
    icon: CircleCheck,
    title: 'Closure Report Submitted',
    description: 'Thank you for letting us know about this closure. Our team will review and update the listing accordingly.',
    backButtonText: 'Browse Other Places',
    backButtonPath: '/places',
  },
};

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = (searchParams.get('type') || 'create') as SubmissionType;
  const placeName = searchParams.get('placeName');

  const config = successConfigs[type] || successConfigs.create;
  const Icon = config.icon;

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="mb-6 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {config.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {type === 'update' && placeName
              ? `Thank you for helping keep ${placeName}'s information up to date! Your suggested changes will be reviewed and applied soon.`
              : config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push(config.backButtonPath)}
              className="rounded-full px-8"
            >
              {config.backButtonText}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
