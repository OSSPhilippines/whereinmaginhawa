import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { AddPlacePageClient } from './add-place-client';

export default async function AddPlacePage() {
  let user: { name: string; email: string } | null = null;

  try {
    const profile = await getProfile();
    if (profile) {
      user = {
        name: profile.display_name || profile.email.split('@')[0],
        email: profile.email,
      };
    }
  } catch {
    // Not logged in — that's fine, form works for anonymous users too
  }

  return <AddPlacePageClient user={user} />;
}
