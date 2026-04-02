import Link from 'next/link';
import { Store, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/place/verified-badge';
import { PlaceImage } from '@/components/place/place-image';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { dbRowToPlaceIndex } from '@/lib/supabase/mappers';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('claimed_by', user.id)
    .order('name');

  const claimedPlaces = (places ?? []).map(dbRowToPlaceIndex);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Places</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your claimed business listings
        </p>
      </div>

      {claimedPlaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No claimed places yet</h3>
            <p className="text-gray-600 mb-4">
              Claim your business on Where In Maginhawa to manage its listing directly.
            </p>
            <Button asChild>
              <Link href="/places">Browse Places</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimedPlaces.map((place) => (
            <Card key={place.id} className="overflow-hidden">
              <div className="relative aspect-video bg-orange-50">
                <PlaceImage
                  src={place.coverImageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  fallbackContent={
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-primary opacity-30" />
                    </div>
                  }
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">{place.name}</CardTitle>
                  <VerifiedBadge />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {place.cuisineTypes.slice(0, 2).map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs capitalize">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{place.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1 gap-1.5">
                    <Link href={`/dashboard/places/${place.id}/edit`}>
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/places/${place.slug}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
