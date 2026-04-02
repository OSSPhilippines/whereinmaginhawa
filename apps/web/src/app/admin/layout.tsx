import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Shield, MessageSquare, FileText, Store } from 'lucide-react';
import { getProfile } from '@/lib/auth';

const sidebarItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/claims', label: 'Claims', icon: Shield },
  { href: '/admin/suggestions', label: 'Suggestions', icon: MessageSquare },
  { href: '/admin/submissions', label: 'Submissions', icon: FileText },
  { href: '/admin/places', label: 'Places', icon: Store },
];

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
    <div className="min-h-screen pt-16 bg-gray-50/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20">
              <nav className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">Admin Panel</h2>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <nav className="flex justify-around py-2">
              {sidebarItems.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
