'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, SlidersHorizontal, Plus, Edit3, Search } from 'lucide-react';
import { PlaceCard } from '@/components/place/place-card';
import { PlaceFilters } from '@/components/filters/place-filters';
import { Button } from '@/components/ui/button';
import { AdUnit } from '@/components/ads/ad-unit';
import { searchPlaces, getAllPlaces } from '@/lib/places';
import type { PlaceIndex, SearchFilters } from '@/types/place';

const AD_INTERVAL = 12;
const ITEMS_PER_PAGE = 24;

interface PlacesContentProps {
  initialPlaces: PlaceIndex[];
}

export function PlacesContent({ initialPlaces }: PlacesContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [places, setPlaces] = useState<PlaceIndex[]>(initialPlaces);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);

  const visiblePlaces = places.slice(0, visibleCount);
  const hasMore = visibleCount < places.length;

  // Intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore) {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, places.length));
      }
    },
    [hasMore, places.length]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    // Get filters from URL
    const query = searchParams.get('q') || '';
    const cuisines = searchParams.get('cuisines')?.split(',').filter(Boolean) || [];
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    const prices = searchParams.get('prices')?.split(',').filter(Boolean) || [];
    const favoritesOnly = searchParams.get('favorites') === 'true';

    const hasFilters = query || cuisines.length > 0 || amenities.length > 0 || prices.length > 0 || favoritesOnly;

    const newFilters: SearchFilters = {
      query: query || undefined,
      cuisineTypes: cuisines.length > 0 ? cuisines : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      priceRanges: prices.length > 0 ? (prices as any[]) : undefined,
      favoritesOnly: favoritesOnly || undefined,
    };

    setFilters(newFilters);

    // On first load with no filters, use server-provided data
    if (initialLoad.current && !hasFilters) {
      initialLoad.current = false;
      return;
    }
    initialLoad.current = false;

    applyFilters(newFilters);
  }, [searchParams]);

  const applyFilters = async (newFilters: SearchFilters) => {
    const results = await searchPlaces(newFilters);
    setPlaces(results.places);
  };

  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();

    if (newFilters.query) {
      params.set('q', newFilters.query);
    }
    if (newFilters.cuisineTypes && newFilters.cuisineTypes.length > 0) {
      params.set('cuisines', newFilters.cuisineTypes.join(','));
    }
    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set('amenities', newFilters.amenities.join(','));
    }
    if (newFilters.priceRanges && newFilters.priceRanges.length > 0) {
      params.set('prices', newFilters.priceRanges.join(','));
    }
    if (newFilters.favoritesOnly) {
      params.set('favorites', 'true');
    }

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
    updateURL(newFilters);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearFilters = async () => {
    const clearedFilters: SearchFilters = {};
    setFilters(clearedFilters);
    const all = await getAllPlaces();
    setPlaces(all);
    setVisibleCount(ITEMS_PER_PAGE);
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Search Bar */}
        <div className="mb-6 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search places..."
              value={filters.query || ''}
              onChange={(e) =>
                handleFiltersChange({
                  ...filters,
                  query: e.target.value || undefined,
                })
              }
              className="w-full pl-11 pr-4 py-3 rounded-full bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all border border-border"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <div className="bg-card rounded-2xl p-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <PlaceFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar - Toggle visibility */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-lg overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <PlaceFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            {places.length === 0 ? (
              <div className="text-center py-20">
                <div className="mb-4">
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  No places found
                </h2>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visiblePlaces.map((place, index) => (
                  <React.Fragment key={place.id}>
                    <PlaceCard place={place} />
                    {(index + 1) % AD_INTERVAL === 0 && index < visiblePlaces.length - 1 && (
                      <div className="col-span-full">
                        <AdUnit
                          slot="4326037632"
                          format="autorelaxed"
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-8">
                  <p className="text-sm text-muted-foreground">Loading more places...</p>
                </div>
              )}

              {!hasMore && places.length > ITEMS_PER_PAGE && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Showing all {places.length} places
                </p>
              )}
              </>
            )}

            {/* Contribute Section */}
            {places.length > 0 && (
              <div className="mt-12 p-8 bg-white rounded-lg border border-gray-200 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Help Us Improve This Directory
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Know a place we&apos;re missing? Found outdated information? Help us keep Where In Maginhawa accurate and comprehensive.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <a
                      href="/add-place"
                    >
                      <Plus className="w-5 h-5" />
                      Add a New Place
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="gap-2"
                  >
                    <a
                      href="https://github.com/OSSPhilippines/whereinmaginhawa/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Edit3 className="w-5 h-5" />
                      Report an Issue
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Filter Button for Mobile */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all z-40 flex items-center gap-2"
        aria-label="Show filters"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="font-medium">Filters</span>
      </button>
    </div>
  );
}
