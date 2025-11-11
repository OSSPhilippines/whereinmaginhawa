'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getPlaceBySlug } from '@/lib/places';
import { csrfFetch } from '@/lib/csrf-client';
import { toast } from 'sonner';
import type { Place } from '@/types/place';

export default function DeletePlacePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Show detailed validation errors if available
        if (data.details) {
          const errors: string[] = [];
          const formatZodErrors = (obj: any, prefix = '') => {
            if (obj._errors && obj._errors.length > 0) {
              errors.push(`${prefix}: ${obj._errors.join(', ')}`);
            }
            for (const [key, value] of Object.entries(obj)) {
              if (key !== '_errors' && typeof value === 'object') {
                formatZodErrors(value, prefix ? `${prefix}.${key}` : key);
              }
            }
          };
          formatZodErrors(data.details);
          toast.error('Validation Failed', {
            description: errors.join('\n'),
            duration: 6000,
          });
        } else {
          toast.error('Submission Failed', {
            description: data.error || 'Failed to submit closure report. Please try again.',
            duration: 5000,
          });
        }
        return;
      }

      // Success!
      toast.success('Report Submitted!', {
        description: 'Your closure report has been received and will be reviewed.',
        duration: 2000,
      });

      // Redirect to success page with query parameters
      setTimeout(() => {
        router.push(`/success?type=delete&prUrl=${encodeURIComponent(data.prUrl)}&placeName=${encodeURIComponent(place!.name)}`);
      }, 500);
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error('Unexpected Error', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
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

            {/* Terms Agreement */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  By submitting this report, you acknowledge and agree to our{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>.
                </p>
                <p className="text-xs text-gray-500">
                  Your report will be publicly visible. If you provide your name or contact information, it will be displayed
                  publicly. We will never sell your data.
                </p>
              </div>
            </div>

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
