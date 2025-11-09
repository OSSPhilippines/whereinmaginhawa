'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPlaceForm } from '@/components/place/add-place-form';

export default function AddPlacePage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  const handleSuccess = (prUrl: string) => {
    setPrUrl(prUrl);
    setIsSubmitted(true);

    // Redirect to GitHub PR after a short delay
    setTimeout(() => {
      window.open(prUrl, '_blank');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isSubmitted && prUrl) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-6 text-6xl">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Submission Received!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for contributing to Where In Maginhawa!
              <br />
              Your submission will be reviewed and added to the directory soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/')}
              >
                Back to Home
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Add a New Place
            </h1>
            <p className="text-lg text-gray-600">
              Know a great restaurant or café in Maginhawa? Share it with the community!
              Your submission will be reviewed and added to the directory.
            </p>
          </div>

          {/* Form */}
          <AddPlaceForm onSuccess={handleSuccess} onCancel={handleCancel} />

          {/* Info Footer */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">1.</span>
                <span>We'll receive your submission and check the information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">2.</span>
                <span>Our team will review and verify the details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">3.</span>
                <span>Once approved, your place will appear on the site!</span>
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
