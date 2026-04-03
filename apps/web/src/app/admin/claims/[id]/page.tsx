'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock, CheckCircle, XCircle, Phone, User, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ClaimDetail {
  id: string;
  place_id: string;
  user_id: string;
  claimant_name: string;
  claimant_phone: string | null;
  claimant_role: string | null;
  proof_text: string | null;
  proof_documents: string[] | null;
  admin_notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  place_name?: string;
  place_slug?: string;
  user_email?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, icon: Clock, color: 'text-honey bg-honey/10', className: 'border-honey/30 bg-honey/8 text-honey' },
  approved: { label: 'Approved', variant: 'outline' as const, icon: CheckCircle, color: 'text-emerald bg-emerald/10', className: 'border-emerald/30 bg-emerald/8 text-emerald' },
  rejected: { label: 'Rejected', variant: 'outline' as const, icon: XCircle, color: 'text-destructive bg-destructive/10', className: 'border-destructive/30 bg-destructive/8 text-destructive' },
};

export default function AdminClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadClaim = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('business_claims')
        .select('*, places(name, slug), profiles!business_claims_user_id_fkey(email)')
        .eq('id', params.id as string)
        .single();

      if (error || !data) {
        toast.error('Claim not found.');
        router.push('/admin/claims');
        return;
      }

      setClaim({
        ...data,
        proof_documents: data.proof_documents ?? [],
        place_name: (data.places as Record<string, unknown> | null)?.name as string,
        place_slug: (data.places as Record<string, unknown> | null)?.slug as string,
        user_email: (data.profiles as Record<string, unknown> | null)?.email as string,
      } as ClaimDetail);
      setIsLoading(false);
    };

    loadClaim();
  }, [params.id, router]);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!claim) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/claims/${claim.id}`, {
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
      setClaim((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast.error('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading claim details...</div>;
  }

  if (!claim) return null;

  const config = statusConfig[claim.status];
  const StatusIcon = config.icon;
  const createdDate = new Date(claim.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <div>
      <Link
        href="/admin/claims"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Claims
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Review</h1>
          <p className="text-gray-600 text-sm mt-1">
            {claim.place_name} &middot; Submitted {createdDate}
          </p>
        </div>
        <Badge variant={config.variant} className={`text-sm px-3 py-1 ${config.className}`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-4">
        {/* Place Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Place</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/places/${claim.place_slug}`}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              {claim.place_name} <ExternalLink className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Claimant Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claimant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{claim.claimant_name}</span>
              {claim.claimant_role && (
                <Badge variant="outline" className="text-xs capitalize">{claim.claimant_role}</Badge>
              )}
            </div>
            {claim.claimant_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {claim.claimant_phone}
              </div>
            )}
            {claim.user_email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-gray-400" />
                Account: {claim.user_email}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proof of Ownership */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Proof of Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {claim.proof_text ? (
              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                <FileText className="w-4 h-4 text-gray-400 inline mr-2" />
                {claim.proof_text}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No written statement provided.</p>
            )}

            {claim.proof_documents && claim.proof_documents.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Uploaded Documents ({claim.proof_documents.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {claim.proof_documents.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border rounded-md p-3 text-xs text-primary hover:bg-primary/5 transition-colors truncate"
                    >
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            )}
          </CardContent>
        </Card>

        {/* Review Actions */}
        {claim.status === 'pending' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Approving this claim will mark the place as verified and grant the claimant business owner access.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Claim
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview('rejected')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Info (if already reviewed) */}
        {claim.status !== 'pending' && claim.reviewed_at && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">
                Reviewed on{' '}
                {new Date(claim.reviewed_at).toLocaleDateString('en-US', {
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
