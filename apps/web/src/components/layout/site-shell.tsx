'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

const PANEL_PREFIXES = ['/admin', '/dashboard'];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanel = PANEL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
