'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditPlaceForm } from '@/components/place/edit-place-form';
import { getPlaceBySlug } from '@/lib/places';
import type { Place } from '@/types/place';

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const placeData = await getPlaceBySlug(slug);
        if (!placeData) {
          router.push('/places');
          return;
        }
        setPlace(placeData);
      } catch (error) {
        console.error('Failed to load place:', error);
        router.push('/places');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [slug, router]);

  const handleSuccess = (prUrl: string) => {
    // Redirect to success page with query parameters
    router.push(`/success?type=update&prUrl=${encodeURIComponent(prUrl)}&placeName=${encodeURIComponent(place?.name || '')}`);
  };

  const handleCancel = () => {
    router.push(`/places/${slug}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!place) {
    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {place.name}
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Suggest Changes to {place.name}
            </h1>
            <p className="text-lg text-gray-600">
              Notice something outdated or incorrect? Help us keep the information accurate!
              Your changes will be reviewed before being published.
            </p>
          </div>

          {/* Form */}
          <EditPlaceForm
            place={place}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />

          {/* Info Footer */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">1.</span>
                <span>We'll receive your suggested changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">2.</span>
                <span>Our team will review the updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">3.</span>
                <span>Once approved, the changes will be published!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">4.</span>
                <span>You can track your submission status using the link we provide</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
