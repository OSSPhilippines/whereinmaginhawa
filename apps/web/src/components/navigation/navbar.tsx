'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MapPin, Plus, Menu, LogOut, LayoutDashboard, Shield, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth/auth-provider';

const categories = [
  { label: 'Cafe', href: '/places?cuisines=cafe' },
  { label: 'Filipino', href: '/places?cuisines=filipino' },
  { label: 'Desserts', href: '/places?cuisines=desserts' },
  { label: 'Street Food', href: '/places?cuisines=street+food' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();

  const isHome = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base text-foreground hidden sm:block">
              Where in Maginhawa
            </span>
          </Link>

          {/* Center: Category links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/places"
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Explore
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/add-place')}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Place
            </Button>

            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                        <span className="text-sm font-bold">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                        {profile?.display_name || user.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      {profile?.role === 'admin' && (
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                    className="rounded-full px-5"
                  >
                    Sign In
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden" suppressHydrationWarning>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" suppressHydrationWarning>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-6">
                  <Link
                    href="/places"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Browse All
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}

                  <div className="border-t border-border my-3" />

                  <Link
                    href="/add-place"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add a New Place
                  </Link>

                  {!isLoading && (
                    <>
                      <div className="border-t border-border my-3" />
                      {user ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium truncate">
                              {profile?.display_name || user.email}
                            </span>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          {profile?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setOpen(false)}
                              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={() => { setOpen(false); signOut(); }}
                            className="px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 px-3">
                          <Button
                            onClick={() => { setOpen(false); router.push('/auth/login'); }}
                            className="w-full rounded-full"
                          >
                            Sign In
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setOpen(false); router.push('/auth/signup'); }}
                            className="w-full rounded-full"
                          >
                            Create Account
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
