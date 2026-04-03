import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect('/auth/login?redirectTo=/dashboard');
  }

  return (
    <DashboardLayoutClient
      user={{
        email: profile.email,
        displayName: profile.display_name,
        isAdmin: profile.role === 'admin',
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
