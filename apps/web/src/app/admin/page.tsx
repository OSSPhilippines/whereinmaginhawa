import Link from 'next/link';
import { Shield, MessageSquare, FileText, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

async function getStats() {
  const supabase = await createClient();

  const [claims, suggestions, submissions, places] = await Promise.all([
    supabase.from('business_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('update_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('place_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('places').select('id', { count: 'exact', head: true }),
  ]);

  return {
    pendingClaims: claims.count ?? 0,
    pendingSuggestions: suggestions.count ?? 0,
    pendingSubmissions: submissions.count ?? 0,
    totalPlaces: places.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    {
      label: 'Pending Claims',
      value: stats.pendingClaims,
      href: '/admin/claims',
      icon: Shield,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Pending Suggestions',
      value: stats.pendingSuggestions,
      href: '/admin/suggestions',
      icon: MessageSquare,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: 'Pending Submissions',
      value: stats.pendingSubmissions,
      href: '/admin/submissions',
      icon: FileText,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Total Places',
      value: stats.totalPlaces,
      href: '/admin/places',
      icon: Store,
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 text-sm mt-1">Manage the Where In Maginhawa directory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
