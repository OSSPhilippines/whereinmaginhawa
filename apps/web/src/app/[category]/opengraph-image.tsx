import { ImageResponse } from 'next/og';
import { getCategoryBySlug, getAllCategorySlugs } from '@/lib/categories';
import type { Category } from '@/types/category';

export const alt = 'Where In Maginhawa Category';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ category: slug }));
}

/**
 * Get gradient colors based on category type
 */
function getCategoryGradient(type: Category['type']) {
  const gradients = {
    cuisine: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    amenity: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    experience: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    price: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  };
  return gradients[type] || gradients.cuisine;
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
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
          Category Not Found
        </div>
      ),
      { ...size }
    );
  }

  const gradient = getCategoryGradient(category.type);

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
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '24px',
            padding: '64px 80px',
            boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
            maxWidth: '1000px',
          }}
        >
          {/* Emoji Icon with Background */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '70px',
              marginBottom: '32px',
            }}
          >
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#b32107' }}>
              {category.heading.charAt(0)}
            </div>
          </div>

          {/* Category Heading */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#111827',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            {category.heading}
          </div>

          {/* Subtitle/Description */}
          <div
            style={{
              fontSize: '22px',
              fontWeight: 500,
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            {/* Extract first sentence from description */}
            {category.description.split('.')[0] + '.'}
          </div>

          {/* Footer Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '2px solid #e5e7eb',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#9ca3af',
                letterSpacing: '0.5px',
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
