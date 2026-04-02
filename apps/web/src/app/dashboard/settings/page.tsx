import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProfile } from '@/lib/auth';

export default async function DashboardSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login?redirectTo=/dashboard/settings');

  const roleLabels: Record<string, string> = {
    user: 'User',
    admin: 'Admin',
    business_owner: 'Business Owner',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900 mt-0.5">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Display Name</label>
            <p className="text-sm text-gray-900 mt-0.5">
              {profile.display_name || 'Not set'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="mt-0.5">
              <Badge variant="secondary">
                {roleLabels[profile.role] || profile.role}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Member Since</label>
            <p className="text-sm text-gray-900 mt-0.5">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
