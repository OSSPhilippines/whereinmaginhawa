import { Suspense } from 'react';
import { getAllPlaces } from '@/lib/places-server';
import { PlacesContent } from './places-content';

export const revalidate = 60;

export default async function PlacesPage() {
  const initialPlaces = await getAllPlaces();

  return (
    <Suspense fallback={null}>
      <PlacesContent initialPlaces={initialPlaces} />
    </Suspense>
  );
}
