'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Claim {
  id: string;
  place_id: string;
  claimant_name: string;
  claimant_phone: string | null;
  claimant_role: string | null;
  proof_text: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  place_name?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, icon: Clock, className: 'border-honey/30 bg-honey/8 text-honey' },
  approved: { label: 'Approved', variant: 'outline' as const, icon: CheckCircle, className: 'border-emerald/30 bg-emerald/8 text-emerald' },
  rejected: { label: 'Rejected', variant: 'outline' as const, icon: XCircle, className: 'border-destructive/30 bg-destructive/8 text-destructive' },
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadClaims = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('business_claims')
      .select('*, places(name)')
      .order('created_at', { ascending: false });

    setClaims(
      (data ?? []).map((c: Record<string, unknown>) => ({
        ...c,
        place_name: (c.places as Record<string, unknown> | null)?.name as string | undefined,
      })) as Claim[]
    );
    setIsLoading(false);
  };

  useEffect(() => { loadClaims(); }, []);

  const handleReview = async (claimId: string, status: 'approved' | 'rejected') => {
    setProcessingId(claimId);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to update claim.');
        return;
      }
      toast.success(`Claim ${status}.`);
      loadClaims();
    } catch {
      toast.error('An error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading claims...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Claims</h1>
        <p className="text-gray-600 text-sm mt-1">Review and manage ownership claims</p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No claims</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const config = statusConfig[claim.status];
            const date = new Date(claim.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });

            return (
              <Card key={claim.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{claim.place_name}</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {claim.claimant_name}
                        {claim.claimant_role && ` (${claim.claimant_role})`}
                        {' '}&middot; {date}
                      </p>
                    </div>
                    <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {claim.proof_text && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {claim.proof_text}
                    </p>
                  )}
                  {claim.claimant_phone && (
                    <p className="text-xs text-gray-500">Phone: {claim.claimant_phone}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/claims/${claim.id}`}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Link>
                    </Button>
                    {claim.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleReview(claim.id, 'approved')}
                          disabled={processingId === claim.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(claim.id, 'rejected')}
                          disabled={processingId === claim.id}
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
