import type { Metadata } from 'next';
import { HeroSection } from '@/components/hero/hero-section';
import { PlaceMarquee } from '@/components/hero/place-marquee';
import { AdUnit } from '@/components/ads/ad-unit';
import placesIndex from '@/data/places.json';
import type { PlaceIndex } from '@/types/place';

export const metadata: Metadata = {
  title: "Where In Maginhawa | Find the Best Restaurants & Cafés in Maginhawa Street",
  description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Discover 225+ restaurants, cafés, and food spots with detailed information on cuisines, prices, amenities, and more.",
  openGraph: {
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Discover 225+ restaurants and cafés.",
    url: "https://whereinmaginhawa.com",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Where In Maginhawa - Find the Best Restaurants & Cafés in Maginhawa Street",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City.",
    images: ["/og-default.png"],
  },
};

// Get a selection of featured places for the marquee
function getFeaturedPlaces(count: number = 20): PlaceIndex[] {
  const places: PlaceIndex[] = placesIndex as PlaceIndex[];

  // Get places with cover images for better visual impact
  const placesWithImages = places.filter(place => place.coverImageUrl);

  // Shuffle and take the specified count
  const shuffled = [...placesWithImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Home() {
  const featuredPlaces = getFeaturedPlaces(20);

  return (
    <main className="min-h-screen pt-16">
      <HeroSection />

      {/* Featured Places Marquee */}
      <section className="py-12 bg-slate-50">
        {/* Heading - contained */}
        <div className="container mx-auto px-4 mb-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Featured Places
            </h2>
            <p className="text-gray-600 text-lg">
              Discover some of the best restaurants and cafés in Maginhawa
            </p>
          </div>
        </div>

        {/* Marquee rows - full width */}
        <div className="space-y-4">
          {/* First row - normal direction */}
          <PlaceMarquee places={featuredPlaces} reverse={false} />

          {/* Second row - reversed direction */}
          <PlaceMarquee places={featuredPlaces.slice().reverse()} reverse={true} />
        </div>
      </section>

      {/* Display Ad */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <AdUnit slot="5597938465" className="max-w-4xl mx-auto" />
        </div>
      </section>
    </main>
  );
}
