'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

interface AdminPlace {
  id: string;
  name: string;
  slug: string;
  address: string;
  cuisine_types: string[] | null;
  price_range: string;
  verified: boolean | null;
  claimed_by: string | null;
  created_at: string;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlaces = async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('places')
        .select('id, name, slug, address, cuisine_types, price_range, verified, claimed_by, created_at')
        .order('name', { ascending: true });

      setPlaces((data ?? []) as AdminPlace[]);
      setIsLoading(false);
    };
    loadPlaces();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading places...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Places</h1>
        <p className="text-gray-600 text-sm mt-1">
          {places.length} place{places.length !== 1 ? 's' : ''} in the directory
        </p>
      </div>

      {places.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No places</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {places.map((place) => (
            <Card key={place.id} className="group">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Link href={`/places/${place.slug}`} className="hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                        {place.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </Link>
                      {place.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                    </CardTitle>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{place.address}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-xs">{place.price_range}</Badge>
                    {place.claimed_by && (
                      <Badge variant="default" className="text-xs">Claimed</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {Array.isArray(place.cuisine_types) && place.cuisine_types.length > 0 && (
                <CardContent className="pt-0 pb-3">
                  <div className="flex gap-1 flex-wrap">
                    {place.cuisine_types.slice(0, 5).map((c) => (
                      <Badge key={c} variant="outline" className="text-xs capitalize">{c}</Badge>
                    ))}
                    {place.cuisine_types.length > 5 && (
                      <span className="text-xs text-gray-400">+{place.cuisine_types.length - 5}</span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
