'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

interface AdminLayoutClientProps {
  user: { email: string; displayName: string | null };
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>
        <AdminHeader user={user} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
