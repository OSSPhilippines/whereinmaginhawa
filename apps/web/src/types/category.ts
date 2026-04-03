import type { SearchFilters } from './place';

/**
 * Category configuration for SEO-optimized landing pages
 * Each category represents a pre-filtered view of places with custom metadata
 */
export interface Category {
  /** URL slug (e.g., "bars-in-maginhawa") */
  slug: string;

  /** Lucide icon name for visual representation */
  icon: string;

  /** SEO-optimized page title */
  title: string;

  /** Meta description for search engines */
  description: string;

  /** H1 heading for the page */
  heading: string;

  /** Rich text content/intro for the category (supports HTML) */
  content: string;

  /** Target keywords for SEO */
  keywords: string[];

  /** Filters to apply when loading places */
  filters: SearchFilters;

  /** Sitemap priority (0.0 - 1.0) */
  priority: number;

  /** Category type for internal classification */
  type: 'cuisine' | 'amenity' | 'experience' | 'price';
}

/**
 * Helper type for category configuration objects
 */
export type CategoryConfig = Record<string, Category>;
