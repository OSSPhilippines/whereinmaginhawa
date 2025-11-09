'use client';

import { Check, X, DollarSign, Utensils, Wifi, Search, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { SearchFilters, PriceRange } from '@/types/place';
import stats from '@/data/stats.json';

// Format cuisine types for display (capitalize first letter)
const CUISINE_TYPES = stats.cuisineTypes
  .map((cuisine) => cuisine.charAt(0).toUpperCase() + cuisine.slice(1))
  .slice(0, 20); // Show top 20 cuisines

const PRICE_RANGES: Array<{ label: string; value: PriceRange; symbol: string }> = [
  { label: 'Budget', value: '$', symbol: '$' },
  { label: 'Moderate', value: '$$', symbol: '$$' },
  { label: 'Upscale', value: '$$$', symbol: '$$$' },
];

// Format amenities for display (convert kebab-case to Title Case)
const formatAmenityLabel = (amenity: string) => {
  return amenity
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AMENITIES = stats.amenities
  .map((amenity) => ({
    label: formatAmenityLabel(amenity),
    value: amenity,
  }))
  .slice(0, 15); // Show top 15 amenities

interface PlaceFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export function PlaceFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PlaceFiltersProps) {
  const toggleCuisine = (cuisine: string) => {
    const currentCuisines = filters.cuisineTypes || [];
    const newCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter((c) => c !== cuisine)
      : [...currentCuisines, cuisine];

    onFiltersChange({
      ...filters,
      cuisineTypes: newCuisines.length > 0 ? newCuisines : undefined,
    });
  };

  const togglePriceRange = (price: PriceRange) => {
    const currentPrices = filters.priceRanges || [];
    const newPrices = currentPrices.includes(price)
      ? currentPrices.filter((p) => p !== price)
      : [...currentPrices, price];

    onFiltersChange({
      ...filters,
      priceRanges: newPrices.length > 0 ? newPrices : undefined,
    });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];

    onFiltersChange({
      ...filters,
      amenities: newAmenities.length > 0 ? newAmenities : undefined,
    });
  };

  const toggleFavorites = () => {
    onFiltersChange({
      ...filters,
      favoritesOnly: !filters.favoritesOnly,
    });
  };

  const hasActiveFilters =
    filters.query ||
    filters.favoritesOnly ||
    (filters.cuisineTypes && filters.cuisineTypes.length > 0) ||
    (filters.priceRanges && filters.priceRanges.length > 0) ||
    (filters.amenities && filters.amenities.length > 0);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search places..."
            value={filters.query || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                query: e.target.value || undefined,
              })
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Favorites Toggle */}
      <button
        onClick={toggleFavorites}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
          filters.favoritesOnly
            ? 'bg-red-50 border-2 border-red-500 text-red-700'
            : 'bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Heart
            className={`w-5 h-5 transition-colors ${
              filters.favoritesOnly ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
          <span className="text-sm font-medium">
            {filters.favoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
          </span>
        </div>
        {filters.favoritesOnly && (
          <Check className="w-5 h-5 text-red-500" />
        )}
      </button>

      {/* Add New Place Button */}
      <a
        href="https://forms.gle/XxUuNUtXYJDsucQv6"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-gray-700 hover:text-primary"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add a New Place</span>
      </a>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500">Refine your search</p>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-primary hover:text-primary hover:bg-primary/5"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
        </div>
        <div className="space-y-2">
          {PRICE_RANGES.map((price) => {
            const isSelected = filters.priceRanges?.includes(price.value);
            return (
              <button
                key={price.value}
                onClick={() => togglePriceRange(price.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-gray-200 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <span className="text-sm font-medium">{price.label}</span>
                <span className={`text-sm font-bold ${isSelected ? 'text-primary-foreground' : 'text-green-600'}`}>
                  {price.symbol}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuisine Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Cuisine Type</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CUISINE_TYPES.map((cuisine) => {
            const isSelected = filters.cuisineTypes?.includes(
              cuisine.toLowerCase()
            );
            return (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine.toLowerCase())}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Amenities</h3>
        </div>
        <div className="space-y-1.5">
          {AMENITIES.map((amenity) => {
            const isSelected = filters.amenities?.includes(amenity.value);
            return (
              <button
                key={amenity.value}
                onClick={() => toggleAmenity(amenity.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  isSelected
                    ? 'bg-primary/5 border border-primary text-gray-900'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium">{amenity.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
