import { MetadataRoute } from 'next';
import { getAllPlaces } from '@/lib/places-server';
import { getAllCategories } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://whereinmaginhawa.com';
  const places = await getAllPlaces();
  const categories = getAllCategories();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/places`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Category pages (SEO landing pages)
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: category.priority,
  }));

  // Dynamic place pages
  const placePages: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${baseUrl}/places/${place.slug}`,
    lastModified: new Date(place.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...placePages];
}
