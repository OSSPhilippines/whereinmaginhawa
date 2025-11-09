'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAutocompleteSuggestions } from '@/lib/places';
import type { Place } from '@/types/place';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    places: Place[];
    tags: string[];
    amenities: string[];
    cuisines: string[];
  }>({
    places: [],
    tags: [],
    amenities: [],
    cuisines: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const results = getAutocompleteSuggestions(query);
        setSuggestions(results);
        setIsOpen(true);
      } else {
        setSuggestions({ places: [], tags: [], amenities: [], cuisines: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      router.push(`/places?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions({ places: [], tags: [], amenities: [], cuisines: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasSuggestions =
    suggestions.places.length > 0 ||
    suggestions.tags.length > 0 ||
    suggestions.amenities.length > 0 ||
    suggestions.cuisines.length > 0;

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-6 h-6" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search for places, cuisines, cravings, or amenities..."
          className="h-16 pl-14 pr-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-400 shadow-sm focus:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && hasSuggestions && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
          >
            {/* Places */}
            {suggestions.places.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Places
                </div>
                <div className="space-y-2">
                  {suggestions.places.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => router.push(`/places/${place.slug}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        {place.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {place.description}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {place.cuisineTypes.slice(0, 2).map((cuisine) => (
                          <Badge
                            key={cuisine}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {cuisine}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">
                          {place.priceRange}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {suggestions.tags.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-700 transition-colors capitalize"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {suggestions.amenities.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Amenities
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.amenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => handleSearch(amenity)}
                      className="px-3 py-1.5 text-sm rounded-full bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-colors capitalize"
                    >
                      {amenity.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisines */}
            {suggestions.cuisines.length > 0 && (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Cuisines
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.cuisines.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => handleSearch(cuisine)}
                      className="px-3 py-1.5 text-sm rounded-full bg-purple-50 hover:bg-purple-100 hover:text-purple-700 transition-colors capitalize"
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
