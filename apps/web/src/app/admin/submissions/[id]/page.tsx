'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, XCircle, MapPin, DollarSign, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SubmissionDetail {
  id: string;
  submitted_by_name: string;
  submitted_by_email: string | null;
  submitted_by_user_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  place_data: Record<string, unknown>;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, className: 'border-honey/30 bg-honey/8 text-honey' },
  approved: { label: 'Approved', variant: 'outline' as const, className: 'border-emerald/30 bg-emerald/8 text-emerald' },
  rejected: { label: 'Rejected', variant: 'outline' as const, className: 'border-destructive/30 bg-destructive/8 text-destructive' },
};

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('place_submissions')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (error || !data) {
        toast.error('Submission not found.');
        router.push('/admin/submissions');
        return;
      }

      setSubmission({
        ...data,
        place_data: (data.place_data ?? {}) as Record<string, unknown>,
      } as SubmissionDetail);
      setIsLoading(false);
    };

    load();
  }, [params.id, router]);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!submission) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to update.');
        return;
      }
      toast.success(`Submission ${status}.`);
      setSubmission((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast.error('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading submission...</div>;
  }

  if (!submission) return null;

  const config = statusConfig[submission.status];
  const pd = submission.place_data;
  const createdDate = new Date(submission.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const operatingHours = pd.operating_hours as Record<string, { open?: string; close?: string; closed?: boolean }> | null;
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div>
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Submissions
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {(pd.name as string) || 'Unnamed Place'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            by {submission.submitted_by_name} &middot; {createdDate}
          </p>
        </div>
        <Badge variant={config.variant} className={`text-sm px-3 py-1 ${config.className}`}>{config.label}</Badge>
      </div>

      <div className="grid gap-4">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!!pd.name && (
              <div>
                <span className="text-gray-500">Name: </span>
                <span className="font-medium">{String(pd.name)}</span>
              </div>
            )}
            {!!pd.description && (
              <div>
                <span className="text-gray-500">Description: </span>
                <span>{String(pd.description)}</span>
              </div>
            )}
            {!!pd.address && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{String(pd.address)}</span>
              </div>
            )}
            {!!pd.price_range && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>{String(pd.price_range)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        {!!(pd.phone || pd.email || pd.website) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {!!pd.phone && <div><span className="text-gray-500">Phone: </span>{String(pd.phone)}</div>}
              {!!pd.email && <div><span className="text-gray-500">Email: </span>{String(pd.email)}</div>}
              {!!pd.website && <div><span className="text-gray-500">Website: </span>{String(pd.website)}</div>}
            </CardContent>
          </Card>
        )}

        {/* Categories & Tags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Categories & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.isArray(pd.cuisine_types) && pd.cuisine_types.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Cuisines</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(pd.cuisine_types as string[]).map((c) => (
                    <Badge key={c} variant="outline" className="text-xs capitalize">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(pd.tags) && pd.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Tags</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(pd.tags as string[]).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />{t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(pd.amenities) && pd.amenities.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Amenities</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(pd.amenities as string[]).map((a) => (
                    <Badge key={a} variant="outline" className="text-xs capitalize">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(pd.specialties) && pd.specialties.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Specialties</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(pd.specialties as string[]).map((s) => (
                    <Badge key={s} variant="outline" className="text-xs capitalize">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operating Hours */}
        {operatingHours && Object.keys(operatingHours).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Operating Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-1 text-sm">
                {dayOrder
                  .filter((day) => operatingHours[day])
                  .map((day) => {
                    const hours = operatingHours[day];
                    return (
                      <div key={day} className="flex justify-between py-1">
                        <span className="capitalize text-gray-600">{day}</span>
                        <span className="font-medium">
                          {hours?.closed ? 'Closed' : `${hours?.open || '?'} - ${hours?.close || '?'}`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images */}
        {!!(pd.cover_image_url || pd.logo_url) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!!pd.cover_image_url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Cover Image</p>
                  <Image
                    src={String(pd.cover_image_url)}
                    alt="Cover"
                    width={800}
                    height={192}
                    className="rounded-md max-h-48 object-cover w-full"
                    unoptimized
                  />
                </div>
              )}
              {!!pd.logo_url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Logo</p>
                  <Image
                    src={String(pd.logo_url)}
                    alt="Logo"
                    width={80}
                    height={80}
                    className="rounded-md w-20 h-20 object-cover"
                    unoptimized
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Actions */}
        {submission.status === 'pending' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Approving will create this place in the database and make it publicly visible.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Create Place
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview('rejected')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {submission.status !== 'pending' && submission.reviewed_at && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">
                Reviewed on{' '}
                {new Date(submission.reviewed_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
