'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

export function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-gray-900">
                Where In Maginhawa
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <InteractiveHoverButton
              onClick={() => router.push('/places')}
              className="bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            >
              Browse Directory
            </InteractiveHoverButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
