import Link from 'next/link';
import { Shield, MessageSquare, FileText, Store, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 30;

interface PendingItem {
  id: string;
  type: 'claim' | 'suggestion' | 'submission';
  label: string;
  detail: string;
  date: string;
  href: string;
}

async function getAdminData() {
  const supabase = await createClient();

  const [claims, suggestions, submissions, places, recentClaims, recentSuggestions, recentSubmissions] = await Promise.all([
    supabase.from('business_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('update_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('place_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('places').select('id', { count: 'exact', head: true }),
    supabase.from('business_claims').select('id, claimant_name, created_at, place_id, places(name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('update_suggestions').select('id, suggested_by_name, created_at, place_id, places(name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('place_submissions').select('id, submitted_by_name, created_at, place_data').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ]);

  const pendingItems: PendingItem[] = [];

  if (recentClaims.data) {
    for (const c of recentClaims.data) {
      const placeName = (c.places as unknown as { name: string } | null)?.name || 'Unknown place';
      pendingItems.push({
        id: c.id,
        type: 'claim',
        label: `Claim for ${placeName}`,
        detail: `by ${c.claimant_name}`,
        date: c.created_at,
        href: `/admin/claims/${c.id}`,
      });
    }
  }

  if (recentSuggestions.data) {
    for (const s of recentSuggestions.data) {
      const placeName = (s.places as unknown as { name: string } | null)?.name || 'Unknown place';
      pendingItems.push({
        id: s.id,
        type: 'suggestion',
        label: `Edit for ${placeName}`,
        detail: `by ${s.suggested_by_name}`,
        date: s.created_at,
        href: `/admin/suggestions/${s.id}`,
      });
    }
  }

  if (recentSubmissions.data) {
    for (const s of recentSubmissions.data) {
      const placeData = s.place_data as Record<string, unknown> | null;
      const placeName = (placeData?.name as string) || 'Unnamed place';
      pendingItems.push({
        id: s.id,
        type: 'submission',
        label: `New: ${placeName}`,
        detail: `by ${s.submitted_by_name}`,
        date: s.created_at,
        href: `/admin/submissions/${s.id}`,
      });
    }
  }

  // Sort by date descending
  pendingItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    stats: {
      pendingClaims: claims.count ?? 0,
      pendingSuggestions: suggestions.count ?? 0,
      pendingSubmissions: submissions.count ?? 0,
      totalPlaces: places.count ?? 0,
    },
    pendingItems: pendingItems.slice(0, 8),
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeConfig = {
  claim: { badge: 'Claim', color: 'bg-primary/8 text-primary border-primary/20' },
  suggestion: { badge: 'Edit', color: 'bg-honey/8 text-honey border-honey/20' },
  submission: { badge: 'New', color: 'bg-emerald/8 text-emerald border-emerald/20' },
};

export default async function AdminOverviewPage() {
  const { stats, pendingItems } = await getAdminData();

  const statCards = [
    {
      label: 'Pending Claims',
      value: stats.pendingClaims,
      href: '/admin/claims',
      icon: Shield,
      accent: 'border-l-primary',
      iconColor: 'text-primary',
    },
    {
      label: 'Pending Suggestions',
      value: stats.pendingSuggestions,
      href: '/admin/suggestions',
      icon: MessageSquare,
      accent: 'border-l-honey',
      iconColor: 'text-honey',
    },
    {
      label: 'Pending Submissions',
      value: stats.pendingSubmissions,
      href: '/admin/submissions',
      icon: FileText,
      accent: 'border-l-emerald',
      iconColor: 'text-emerald',
    },
    {
      label: 'Total Places',
      value: stats.totalPlaces,
      href: '/admin/places',
      icon: Store,
      accent: 'border-l-foreground',
      iconColor: 'text-foreground',
    },
  ];

  const totalPending = stats.pendingClaims + stats.pendingSuggestions + stats.pendingSubmissions;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalPending > 0 ? `${totalPending} items need your attention` : 'Everything is up to date'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div className={`bg-card rounded-lg border border-border border-l-[3px] ${card.accent} px-4 py-4 hover:shadow-sm transition-shadow cursor-pointer`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{card.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Needs attention */}
      {pendingItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
          </div>

          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {pendingItems.map((item) => {
              const config = typeConfig[item.type];
              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors group"
                >
                  <Badge variant="outline" className={`text-[10px] font-semibold shrink-0 ${config.color}`}>
                    {config.badge}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/60 shrink-0">{timeAgo(item.date)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
