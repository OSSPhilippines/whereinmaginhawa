'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, CheckCircle, ExternalLink, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AdminPlace {
  id: string;
  name: string;
  slug: string;
  address: string;
  cuisine_types: string[] | null;
  price_range: string;
  verified: boolean | null;
  claimed_by: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  created_at: string;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const loadPlaces = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('places')
      .select('id, name, slug, address, cuisine_types, price_range, verified, claimed_by, cover_image_url, logo_url, created_at')
      .order('name', { ascending: true });

    setPlaces((data ?? []) as AdminPlace[]);
    setIsLoading(false);
  };

  useEffect(() => { loadPlaces(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return places;
    const q = query.toLowerCase();
    return places.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.cuisine_types?.some((c) => c.toLowerCase().includes(q))
    );
  }, [places, query]);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => ({
    total: places.length,
    verified: places.filter((p) => p.verified).length,
    claimed: places.filter((p) => p.claimed_by).length,
  }), [places]);

  const handleDelete = async (place: AdminPlace) => {
    if (!confirm(`Delete "${place.name}"? This cannot be undone.`)) return;
    setDeletingId(place.id);
    try {
      const res = await fetch(`/api/admin/places/${place.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to delete.');
        return;
      }
      toast.success(`"${place.name}" deleted.`);
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
    } catch {
      toast.error('An error occurred.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading places...</div>;
  }

  return (
    <div>
      {/* Header with stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Places</h1>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-muted-foreground">{stats.total} total</span>
          <span className="text-emerald">{stats.verified} verified</span>
          <span className="text-primary">{stats.claimed} claimed</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, address, or cuisine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      {query && (
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {query ? 'No matches' : 'No places'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {query ? 'Try a different search term.' : 'The directory is empty.'}
          </p>
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {paginated.map((place) => (
            <div
              key={place.id}
              className="group flex items-center gap-4 bg-card rounded-xl p-3 hover:shadow-sm transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {place.cover_image_url ? (
                  <Image
                    src={place.cover_image_url}
                    alt={place.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : place.logo_url ? (
                  <Image
                    src={place.logo_url}
                    alt={place.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/places/${place.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary truncate inline-flex items-center gap-1"
                  >
                    {place.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0" />
                  </Link>
                  {place.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                {Array.isArray(place.cuisine_types) && place.cuisine_types.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {place.cuisine_types.slice(0, 3).map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px] capitalize px-1.5 py-0">{c}</Badge>
                    ))}
                    {place.cuisine_types.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{place.cuisine_types.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: badges + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">{place.price_range}</Badge>
                {place.claimed_by && <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/10">Claimed</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(place)}
                  disabled={deletingId === place.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (page === 1 || page === totalPages) return true;
                  return Math.abs(page - currentPage) <= 1;
                })
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <span className="px-1 text-muted-foreground text-sm">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
