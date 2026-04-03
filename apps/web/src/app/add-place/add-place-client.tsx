'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPlaceForm } from '@/components/place/add-place-form';

interface AddPlacePageClientProps {
  user: { name: string; email: string } | null;
}

export function AddPlacePageClient({ user }: AddPlacePageClientProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Join the{' '}
            <span className="bg-gradient-to-r from-primary to-[#d63c20] bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Maginhawa is built on shared flavors and local stories. Tell us about your
            kitchen, and let&apos;s put your restaurant on the map for every food explorer.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <AddPlaceForm
            onSuccess={() => router.push('/success?type=create')}
            onCancel={() => router.push('/')}
            defaultContributor={user}
          />
        </div>
      </div>
    </main>
  );
}
