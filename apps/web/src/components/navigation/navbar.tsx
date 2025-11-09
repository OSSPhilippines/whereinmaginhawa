'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Menu } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Button
              variant="outline"
              onClick={() => router.push('/add-place')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add a New Place
            </Button>
            <InteractiveHoverButton
              onClick={() => router.push('/places')}
              className="bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            >
              Browse Directory
            </InteractiveHoverButton>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      router.push('/add-place');
                    }}
                    className="gap-2 w-full justify-start"
                  >
                    <Plus className="w-4 h-4" />
                    Add a New Place
                  </Button>
                  <Link
                    href="/places"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    Browse Directory
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
