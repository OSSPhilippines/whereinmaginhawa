'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getPlaceBySlug } from '@/lib/places';
import { csrfFetch } from '@/lib/csrf-client';
import type { Place } from '@/types/place';

export default function DeletePlacePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [reason, setReason] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        slug: place!.slug,
        name: place!.name,
        reason: reason || undefined,
        contributorName: contributorName || undefined,
        contributorEmail: contributorEmail || undefined,
      };

      const response = await csrfFetch('/api/places/delete-pr', {
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit closure report. Please try again.');
      }

      // Success!
      setPrUrl(data.prUrl);
      setIsSubmitted(true);

      // Redirect to GitHub PR after a short delay
      setTimeout(() => {
        window.open(data.prUrl, '_blank');
      }, 2000);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  if (isSubmitted && prUrl) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-6 text-6xl">✅</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Closure Report Submitted
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for letting us know that {place.name} is no longer operating.
              <br />
              Our team will review and update the listing accordingly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/places')}
              >
                Browse Other Places
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(prUrl, '_blank')}
              >
                View Submission Status
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
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
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Report Place Closure
                </h1>
                <p className="text-lg text-gray-600">
                  Let us know if <strong>{place.name}</strong> is permanently closed or no longer operating.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Closure Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-1">
                    Reason or Additional Details (Optional)
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="e.g., Permanently closed, Moved to a new location, etc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Any additional information about the closure
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Submitting this report will request the removal of this place from our directory.
                    Our team will verify the closure before making changes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Information (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Help us verify this report by providing your contact information.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="contributorName" className="block text-sm font-medium mb-1">
                    Your Name
                  </label>
                  <Input
                    id="contributorName"
                    name="contributorName"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="contributorEmail" className="block text-sm font-medium mb-1">
                    Your Email
                  </label>
                  <Input
                    id="contributorEmail"
                    name="contributorEmail"
                    type="email"
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="destructive">
                {isSubmitting ? 'Submitting...' : 'Report Closure'}
              </Button>
            </div>
          </form>

          {/* Info Footer */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">1.</span>
                <span>We'll receive your closure report</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">2.</span>
                <span>Our team will verify the information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">3.</span>
                <span>If confirmed, the place will be removed from the directory</span>
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
