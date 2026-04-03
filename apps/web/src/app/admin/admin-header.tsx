'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const pageNames: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/claims': 'Claims',
  '/admin/suggestions': 'Suggestions',
  '/admin/submissions': 'Submissions',
  '/admin/places': 'Places',
};

interface AdminHeaderProps {
  user: { email: string; displayName: string | null };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = (user.displayName || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  // Build breadcrumb segments
  const segments: { label: string; href?: string }[] = [{ label: 'Admin', href: '/admin' }];

  const knownPage = Object.entries(pageNames).find(([path]) => pathname === path);
  if (knownPage && knownPage[0] !== '/admin') {
    segments.push({ label: knownPage[1] });
  } else if (!knownPage) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const section = parts[1];
      const sectionName = pageNames[`/admin/${section}`] || section;
      segments.push({ label: sectionName, href: `/admin/${section}` });
      if (parts.length >= 3) {
        segments.push({ label: 'Detail' });
      }
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((seg, i) => (
              <React.Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {seg.href && i < segments.length - 1 ? (
                    <BreadcrumbLink href={seg.href}>{seg.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* User dropdown - right side */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8">
                <Avatar className="h-6 w-6 rounded-md">
                  <AvatarFallback className="rounded-md text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
