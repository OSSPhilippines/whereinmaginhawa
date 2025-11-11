import { ImageResponse } from 'next/og';
import { getPlaceBySlug, getAllPlaces } from '@/lib/places';

export const alt = 'Where In Maginhawa Place';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const places = getAllPlaces();
  return places.map((place) => ({
    slug: place.slug,
  }));
}

/**
 * Get gradient based on price range
 */
function getPriceGradient(priceRange: string) {
  const gradients = {
    $: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green - Budget
    $$: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue - Moderate
    $$$: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple - Upscale
    $$$$: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink - Premium
  };
  return gradients[priceRange as keyof typeof gradients] || gradients.$$;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          Place Not Found
        </div>
      ),
      { ...size }
    );
  }

  const gradient = getPriceGradient(place.priceRange);
  const firstCuisine = place.cuisineTypes[0] || 'Restaurant';
  const cuisineDisplay =
    place.cuisineTypes.length > 1
      ? `${firstCuisine} & ${place.cuisineTypes.length - 1} more`
      : firstCuisine;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: gradient,
          padding: '48px',
        }}
      >
        {/* Main Content Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '24px',
            padding: '48px 64px',
            boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
            width: '1000px',
            height: '480px',
          }}
        >
          {/* Top Section: Logo/Initial + Name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Logo or Initial */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '48px', fontWeight: 'bold' }}>
                {place.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Place Name */}
            <div
              style={{
                fontSize: '42px',
                fontWeight: 800,
                color: '#111827',
                textAlign: 'center',
                maxWidth: '800px',
                lineHeight: 1.2,
                marginBottom: '12px',
                display: 'flex',
              }}
            >
              {place.name}
            </div>

            {/* Cuisine Types */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '16px',
                textTransform: 'capitalize',
                display: 'flex',
              }}
            >
              {cuisineDisplay}
            </div>
          </div>

          {/* Middle Section: Description */}
          <div
            style={{
              fontSize: '18px',
              color: '#4b5563',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.5,
              display: 'flex',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {place.description.substring(0, 120)}
            {place.description.length > 120 ? '...' : ''}
          </div>

          {/* Bottom Section: Price + Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '24px',
              borderTop: '2px solid #e5e7eb',
            }}
          >
            {/* Price Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#15803d',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  padding: '8px 20px',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                {place.priceRange}
              </div>
            </div>

            {/* Location */}
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              📍 Maginhawa Street
            </div>

            {/* Branding */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#9ca3af',
                letterSpacing: '0.5px',
                display: 'flex',
              }}
            >
              WHEREINMAGINHAWA.COM
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
