import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { AdminLayoutClient } from './admin-layout-client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect('/auth/login?redirectTo=/admin');
  }
  if (profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <AdminLayoutClient
      user={{
        email: profile.email,
        displayName: profile.display_name,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
