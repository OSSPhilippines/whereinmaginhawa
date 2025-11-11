import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PlaceCard } from '@/components/place/place-card';
import { Button } from '@/components/ui/button';
import { Plus, Edit3 } from 'lucide-react';
import { searchPlaces } from '@/lib/places';
import {
  getCategoryBySlug,
  getAllCategorySlugs,
  isValidCategory,
} from '@/lib/categories';
import type { PlaceIndex } from '@/types/place';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

/**
 * Generate static params for all category pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();

  return slugs.map((slug) => ({
    category: slug,
  }));
}

/**
 * Generate dynamic metadata for SEO optimization
 */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  const url = `https://whereinmaginhawa.com/${category.slug}`;

  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      url,
      siteName: 'Where In Maginhawa',
      type: 'website',
      // images array removed - Next.js will automatically use opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      title: category.title,
      description: category.description,
      // images array removed - Next.js will automatically use opengraph-image.tsx
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Category landing page with pre-filtered places
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params (Next.js 15+ requirement)
  const { category: categorySlug } = await params;

  // Validate category exists
  if (!isValidCategory(categorySlug)) {
    notFound();
  }

  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Pre-filter places based on category configuration
  const { places } = searchPlaces(category.filters);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Category Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Emoji Icon */}
          <div className="mb-6">
            <span className="text-8xl" role="img" aria-label={category.heading}>
              {category.emoji}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {category.heading}
          </h1>

          {/* Category Description */}
          <div
            className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: category.content }}
          />

          {/* Results Count */}
          <p className="text-sm text-gray-500">
            {places.length} {places.length === 1 ? 'place' : 'places'} found
          </p>
        </div>

        {/* Places Grid */}
        {places.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No places found
            </h2>
            <p className="text-gray-600">
              We're working on adding more places in this category. Check back
              soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
            {places.map((place: PlaceIndex) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}

        {/* Contribute Section */}
        {places.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Help Us Improve This Directory
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Know a place we're missing? Found outdated information? Help us
              keep Where In Maginhawa accurate and comprehensive.
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

        {/* SEO Content - Related Categories */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-gray-500">
            Explore more:{' '}
            <a
              href="/places"
              className="text-primary hover:underline"
            >
              All Places in Maginhawa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
