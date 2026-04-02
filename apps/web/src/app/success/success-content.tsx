'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type SubmissionType = 'create' | 'update' | 'delete';

interface SuccessConfig {
  emoji: string;
  title: string;
  description: string;
  backButtonText: string;
  backButtonPath: string;
}

const successConfigs: Record<SubmissionType, SuccessConfig> = {
  create: {
    emoji: '🎉',
    title: 'Submission Received!',
    description: 'Thank you for contributing to Where In Maginhawa! Your submission will be reviewed and added to the directory soon.',
    backButtonText: 'Back to Home',
    backButtonPath: '/',
  },
  update: {
    emoji: '🎉',
    title: 'Changes Submitted!',
    description: 'Thank you for helping keep the information up to date! Your suggested changes will be reviewed and applied soon.',
    backButtonText: 'Back to Places',
    backButtonPath: '/places',
  },
  delete: {
    emoji: '✅',
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

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="mb-6 text-6xl">{config.emoji}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {config.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {type === 'update' && placeName
              ? `Thank you for helping keep ${placeName}'s information up to date! Your suggested changes will be reviewed and applied soon.`
              : config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push(config.backButtonPath)}
            >
              {config.backButtonText}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
