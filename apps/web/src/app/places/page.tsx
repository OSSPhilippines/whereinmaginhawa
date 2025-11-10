'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { X, SlidersHorizontal, Plus, Edit3 } from 'lucide-react';
import { PlaceCard } from '@/components/place/place-card';
import { PlaceFilters } from '@/components/filters/place-filters';
import { Button } from '@/components/ui/button';
import { searchPlaces, getAllPlaces } from '@/lib/places';
import type { PlaceIndex, SearchFilters } from '@/types/place';

function PlacesContent() {
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<PlaceIndex[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Get query from URL
    const query = searchParams.get('q') || '';
    const initialFilters: SearchFilters = {
      query: query || undefined,
    };

    setFilters(initialFilters);
    applyFilters(initialFilters);
  }, [searchParams]);

  const applyFilters = (newFilters: SearchFilters) => {
    const results = searchPlaces(newFilters);
    setPlaces(results.places);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {};
    setFilters(clearedFilters);
    setPlaces(getAllPlaces());
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar - Always visible on large screens */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
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
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  No places found
                </h2>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}

            {/* Contribute Section */}
            {places.length > 0 && (
              <div className="mt-12 p-8 bg-white rounded-lg border border-gray-200 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Help Us Improve This Directory
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Know a place we're missing? Found outdated information? Help us keep Where In Maginhawa accurate and comprehensive.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <a
                      href="https://forms.gle/XxUuNUtXYJDsucQv6"
                      target="_blank"
                      rel="noopener noreferrer"
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
                      href="https://forms.gle/pu9VjrG7JNkYmm9K9"
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

export default function PlacesPage() {
  return (
    <Suspense fallback={null}>
      <PlacesContent />
    </Suspense>
  );
}
