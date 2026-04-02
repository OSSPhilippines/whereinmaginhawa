'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PlaceInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
}

export default function ClaimPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState<'owner' | 'manager' | 'representative'>('owner');
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);
  const [listingUrl, setListingUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/places/${slug}/claim`)}`);
    }
  }, [authLoading, user, router, slug]);

  // Load place data
  useEffect(() => {
    async function loadPlace() {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, slug, address')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        toast.error('Place not found');
        router.push('/places');
        return;
      }
      setPlace(data);
      setLoading(false);
    }

    if (user) loadPlace();
  }, [slug, user, supabase, router]);

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file);

    if (error) {
      console.info('File upload error:', error);
      return null;
    }
    return fileName;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!place || !user) return;

    if (!agreedToTerms) {
      toast.error('Please agree to the terms before submitting');
      return;
    }

    setSubmitting(true);

    // Upload verification documents
    const uploadedPaths: string[] = [];
    for (const file of verificationFiles) {
      const path = await uploadFile(file);
      if (path) uploadedPaths.push(path);
    }

    // Submit claim via API
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place_id: place.id,
        claimant_name: contactName,
        claimant_phone: contactPhone || null,
        claimant_role: contactRole,
        proof_documents: uploadedPaths,
        proof_text: [statement, listingUrl].filter(Boolean).join('\n\nListing URL: ') || null,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || 'Failed to submit claim');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    toast.success('Claim submitted successfully!');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setVerificationFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeFile(index: number) {
    setVerificationFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Claim Submitted</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Your ownership claim for <strong>{place?.name}</strong> has been submitted
                for review. We&apos;ll notify you once it&apos;s been processed.
              </p>
              <Button asChild>
                <Link href={`/places/${slug}`}>Back to {place?.name}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 gap-2"
        >
          <Link href={`/places/${slug}`}>
            <ChevronLeft className="w-4 h-4" />
            Back to {place?.name}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Claim {place?.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Verify your ownership to manage this business listing at{' '}
              <span className="font-medium">{place?.address}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="space-y-2">
                  <label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactRole" className="text-sm font-medium text-gray-700">
                    Your Role *
                  </label>
                  <select
                    id="contactRole"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value as 'owner' | 'manager' | 'representative')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="representative">Authorized Representative</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* Section 2: Verification Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verification Documents</h3>
                <p className="text-sm text-gray-500">
                  Upload documents that prove your connection to this business
                  (e.g., business permit, DTI certificate, photo at establishment).
                </p>
                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload documents</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  {verificationFiles.length > 0 && (
                    <div className="space-y-2">
                      {verificationFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="listingUrl" className="text-sm font-medium text-gray-700">
                    Facebook/Google Business Listing URL
                  </label>
                  <Input
                    id="listingUrl"
                    type="url"
                    value={listingUrl}
                    onChange={(e) => setListingUrl(e.target.value)}
                    placeholder="https://facebook.com/yourbusiness"
                  />
                </div>
              </div>

              <Separator />

              {/* Section 3: Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="space-y-2">
                  <label htmlFor="statement" className="text-sm font-medium text-gray-700">
                    Brief Statement
                  </label>
                  <textarea
                    id="statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Tell us about your connection to this business..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm that I am authorized to claim this business and that the
                    information provided is accurate. I understand that false claims may
                    result in account suspension.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !agreedToTerms}
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
