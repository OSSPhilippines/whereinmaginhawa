'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SuggestionDetail {
  id: string;
  place_id: string;
  suggested_by_name: string;
  suggested_by_email: string | null;
  suggested_by_user_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, { old?: unknown; new?: unknown; reason?: string; _type?: string }>;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  place_name?: string;
  place_slug?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const },
  approved: { label: 'Approved', variant: 'default' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (Array.isArray(value)) return value.join(', ') || '(empty)';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export default function AdminSuggestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('update_suggestions')
        .select('*, places(name, slug)')
        .eq('id', params.id as string)
        .single();

      if (error || !data) {
        toast.error('Suggestion not found.');
        router.push('/admin/suggestions');
        return;
      }

      setSuggestion({
        ...data,
        changes: (data.changes ?? {}) as SuggestionDetail['changes'],
        place_name: (data.places as Record<string, unknown> | null)?.name as string,
        place_slug: (data.places as Record<string, unknown> | null)?.slug as string,
      } as SuggestionDetail);
      setIsLoading(false);
    };

    load();
  }, [params.id, router]);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!suggestion) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/suggestions/${suggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to update.');
        return;
      }
      toast.success(`Suggestion ${status}.`);
      setSuggestion((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast.error('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading suggestion...</div>;
  }

  if (!suggestion) return null;

  const config = statusConfig[suggestion.status];
  const isClosureReport = (suggestion.changes as Record<string, unknown>)?._type === 'closure_report';
  const changedFields = Object.keys(suggestion.changes).filter((k) => !k.startsWith('_'));
  const createdDate = new Date(suggestion.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <div>
      <Link
        href="/admin/suggestions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Suggestions
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isClosureReport ? 'Closure Report' : 'Update Suggestion'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {suggestion.place_name} &middot; Submitted {createdDate}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {isClosureReport && <Badge variant="destructive">Closure</Badge>}
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Place & Submitter Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Place: </span>
              <Link
                href={`/places/${suggestion.place_slug}`}
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                {suggestion.place_name} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <span className="text-gray-500">Submitted by: </span>
              <span className="font-medium">{suggestion.suggested_by_name}</span>
              {suggestion.suggested_by_email && (
                <span className="text-gray-400 ml-1">({suggestion.suggested_by_email})</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Changes Diff */}
        {isClosureReport ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Closure Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-100 p-4 rounded-md text-sm text-red-800">
                {(suggestion.changes as Record<string, unknown>).reason as string || 'No reason provided.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Proposed Changes ({changedFields.length} field{changedFields.length !== 1 ? 's' : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {changedFields.map((field) => {
                  const change = suggestion.changes[field];
                  return (
                    <div key={field} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {field.replace(/_/g, ' ')}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-50 border border-red-100 rounded-md p-2.5">
                          <p className="text-[10px] font-medium text-red-400 uppercase mb-1">Current</p>
                          <p className="text-sm text-red-700 whitespace-pre-wrap break-words">
                            {formatValue(change?.old)}
                          </p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-md p-2.5">
                          <p className="text-[10px] font-medium text-green-400 uppercase mb-1">Proposed</p>
                          <p className="text-sm text-green-700 whitespace-pre-wrap break-words">
                            {formatValue(change?.new)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Actions */}
        {suggestion.status === 'pending' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                {isClosureReport
                  ? 'Approving this will not automatically remove the place. Review the closure reason and take manual action if needed.'
                  : 'Approving will apply the proposed changes to the place.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
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

        {suggestion.status !== 'pending' && suggestion.reviewed_at && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">
                Reviewed on{' '}
                {new Date(suggestion.reviewed_at).toLocaleDateString('en-US', {
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
