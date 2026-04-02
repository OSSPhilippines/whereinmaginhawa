import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
  approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
};

export default async function DashboardSuggestionsPage() {
  const user = await getSession();
  if (!user) redirect('/auth/login?redirectTo=/dashboard/suggestions');

  const supabase = await createClient();

  // Get places owned by this user
  const { data: ownedPlaces } = await supabase
    .from('places')
    .select('id, name, slug')
    .eq('claimed_by', user.id);

  const ownedPlaceIds = (ownedPlaces ?? []).map((p) => p.id);

  // Get suggestions for owned places
  let suggestions: Array<{
    id: string;
    place_id: string;
    suggested_by_name: string;
    status: 'pending' | 'approved' | 'rejected';
    changes: Record<string, unknown>;
    created_at: string;
    place_name?: string;
  }> = [];

  if (ownedPlaceIds.length > 0) {
    const { data } = await supabase
      .from('update_suggestions')
      .select('id, place_id, suggested_by_name, status, changes, created_at')
      .in('place_id', ownedPlaceIds)
      .order('created_at', { ascending: false });

    suggestions = (data ?? []).map((s) => ({
      ...s,
      status: s.status as 'pending' | 'approved' | 'rejected',
      changes: (s.changes ?? {}) as Record<string, unknown>,
      place_name: ownedPlaces?.find((p) => p.id === s.place_id)?.name,
    }));
  }

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suggestions</h1>
        <p className="text-gray-600 text-sm mt-1">
          Review change suggestions from the community for your places
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No suggestions yet</h3>
            <p className="text-gray-600">
              {ownedPlaceIds.length === 0
                ? 'Claim a business to start receiving community suggestions.'
                : "When users suggest changes to your places, they'll appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const config = statusConfig[suggestion.status];
            const changedFields = Object.keys(suggestion.changes).filter((k) => !k.startsWith('_'));
            const formattedDate = new Date(suggestion.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Link key={suggestion.id} href={`/dashboard/suggestions/${suggestion.id}`} className="block">
                <Card className="hover:border-gray-300 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                          {suggestion.place_name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                          by {suggestion.suggested_by_name} &middot; {formattedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant} className="shrink-0">
                          {config.label}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-1.5 flex-wrap">
                      {changedFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs capitalize">
                          {field.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
