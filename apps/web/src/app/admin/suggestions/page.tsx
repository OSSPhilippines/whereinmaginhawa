'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Suggestion {
  id: string;
  place_id: string;
  suggested_by_name: string;
  suggested_by_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, { old?: unknown; new?: unknown; reason?: string; _type?: string }>;
  created_at: string;
  place_name?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, className: 'border-honey/30 bg-honey/8 text-honey' },
  approved: { label: 'Approved', variant: 'outline' as const, className: 'border-emerald/30 bg-emerald/8 text-emerald' },
  rejected: { label: 'Rejected', variant: 'outline' as const, className: 'border-destructive/30 bg-destructive/8 text-destructive' },
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadSuggestions = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('update_suggestions')
      .select('*, places(name)')
      .order('created_at', { ascending: false });

    setSuggestions(
      (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        changes: (s.changes ?? {}) as Suggestion['changes'],
        place_name: (s.places as Record<string, unknown> | null)?.name as string | undefined,
      })) as Suggestion[]
    );
    setIsLoading(false);
  };

  useEffect(() => { loadSuggestions(); }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/suggestions/${id}`, {
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
      loadSuggestions();
    } catch {
      toast.error('An error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading suggestions...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Suggestions</h1>
        <p className="text-gray-600 text-sm mt-1">Review community-suggested changes to places</p>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No suggestions</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => {
            const config = statusConfig[s.status];
            const date = new Date(s.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            const isClosureReport = (s.changes as Record<string, unknown>)?._type === 'closure_report';
            const changedFields = Object.keys(s.changes).filter((k) => !k.startsWith('_'));

            return (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {s.place_name}
                        {isClosureReport && (
                          <Badge variant="destructive" className="ml-2 text-xs">Closure Report</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {s.suggested_by_name} &middot; {date}
                      </p>
                    </div>
                    <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {isClosureReport ? (
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md">
                      Reason: {(s.changes as Record<string, unknown>).reason as string || 'Not specified'}
                    </p>
                  ) : (
                    <>
                      <div className="flex gap-1.5 flex-wrap">
                        {changedFields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs capitalize">
                            {field.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      {/* Diff preview for first changed field */}
                      {changedFields.length > 0 && (
                        <div className="text-xs bg-gray-50 p-3 rounded-md space-y-1 max-h-32 overflow-y-auto">
                          {changedFields.slice(0, 3).map((field) => {
                            const change = s.changes[field];
                            return (
                              <div key={field}>
                                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>
                                <span className="text-red-600 line-through ml-1">
                                  {typeof change?.old === 'object' ? JSON.stringify(change.old) : String(change?.old ?? '')}
                                </span>
                                <span className="text-emerald ml-1">
                                  {typeof change?.new === 'object' ? JSON.stringify(change.new) : String(change?.new ?? '')}
                                </span>
                              </div>
                            );
                          })}
                          {changedFields.length > 3 && (
                            <p className="text-gray-400">+{changedFields.length - 3} more fields</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/suggestions/${s.id}`}>
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
