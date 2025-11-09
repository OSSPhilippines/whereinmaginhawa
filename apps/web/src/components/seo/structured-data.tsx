import type { Place } from '@/types/place';

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Where In Maginhawa',
    description: 'Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher\'s Village, Quezon City',
    url: 'https://whereinmaginhawa.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://whereinmaginhawa.com/places?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function LocalBusinessStructuredData({ place }: { place: Place }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: place.name,
    description: place.description,
    url: `https://whereinmaginhawa.com/places/${place.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address,
      addressLocality: 'Quezon City',
      addressRegion: 'Metro Manila',
      addressCountry: 'PH',
    },
    ...(place.phone && { telephone: place.phone }),
    ...(place.email && { email: place.email }),
    ...(place.website && { url: place.website }),
    ...(place.coverImageUrl && { image: place.coverImageUrl }),
    priceRange: place.priceRange,
    servesCuisine: place.cuisineTypes,
    paymentAccepted: place.paymentMethods.join(', '),
    openingHoursSpecification: Object.entries(place.operatingHours).map(
      ([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
        ...(hours.closed
          ? {}
          : {
              opens: hours.open,
              closes: hours.close,
            }),
      })
    ),
    ...(place.latitude &&
      place.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: place.latitude,
          longitude: place.longitude,
        },
      }),
    ...(place.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: place.rating,
        reviewCount: place.reviewCount || 0,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
