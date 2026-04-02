'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Submission {
  id: string;
  submitted_by_name: string;
  submitted_by_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  place_data: Record<string, unknown>;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const },
  approved: { label: 'Approved', variant: 'default' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('place_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    setSubmissions(
      (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        place_data: (s.place_data ?? {}) as Record<string, unknown>,
      })) as Submission[]
    );
    setIsLoading(false);
  };

  useEffect(() => { loadSubmissions(); }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
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
      loadSubmissions();
    } catch {
      toast.error('An error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading submissions...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Place Submissions</h1>
        <p className="text-gray-600 text-sm mt-1">Review new place submissions from the community</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No submissions</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const config = statusConfig[s.status];
            const date = new Date(s.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            const pd = s.place_data;

            return (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {(pd.name as string) || 'Unnamed Place'}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {s.submitted_by_name} &middot; {date}
                      </p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="text-xs bg-gray-50 p-3 rounded-md space-y-1 max-h-40 overflow-y-auto">
                    {pd.address ? (
                      <div><span className="font-medium">Address:</span> {String(pd.address)}</div>
                    ) : null}
                    {pd.description ? (
                      <div><span className="font-medium">Description:</span> {String(pd.description).slice(0, 120)}...</div>
                    ) : null}
                    {pd.price_range ? (
                      <div><span className="font-medium">Price:</span> {String(pd.price_range)}</div>
                    ) : null}
                    {Array.isArray(pd.cuisine_types) && pd.cuisine_types.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {(pd.cuisine_types as string[]).map((c) => (
                          <Badge key={c} variant="outline" className="text-xs capitalize">{c}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/submissions/${s.id}`}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Link>
                    </Button>
                    {s.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleReview(s.id, 'approved')}
                          disabled={processingId === s.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(s.id, 'rejected')}
                          disabled={processingId === s.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
