'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Heart, Star, Image as ImageIcon } from 'lucide-react';
import { PlaceImage } from './place-image';
import { VerifiedBadge } from './verified-badge';
import type { PlaceIndex } from '@/types/place';

interface PlaceCardProps {
  place: PlaceIndex;
}

const FAVORITES_KEY = 'whereinmaginhawa_favorites';

export function PlaceCard({ place }: PlaceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const favorites: string[] = stored ? JSON.parse(stored) : [];
    setIsFavorite(favorites.includes(place.id));
  }, [place.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem(FAVORITES_KEY);
    const favorites: string[] = stored ? JSON.parse(stored) : [];
    const newFavorites = favorites.includes(place.id)
      ? favorites.filter((id) => id !== place.id)
      : [...favorites, place.id];
    setIsFavorite(!favorites.includes(place.id));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  return (
    <Link href={`/places/${place.slug}`} className="group block">
      <article className="bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <PlaceImage
            src={place.coverImageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackContent={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <ImageIcon className="w-12 h-12 text-primary/20" />
              </div>
            }
          />

          {/* Favorite */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            />
          </button>

          {/* Category label */}
          {place.cuisineTypes.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-semibold uppercase tracking-wider text-foreground">
                {place.cuisineTypes[0]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2.5">
          {/* Rating + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">4.0</span>
            </div>
            <span className="text-sm font-bold text-emerald-700">{place.priceRange}</span>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {place.name}
            {place.verified && (
              <span className="ml-1.5 align-middle inline-block">
                <VerifiedBadge />
              </span>
            )}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          {/* Footer: Location + Tags */}
          <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{place.address}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
