'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Menu, LogOut, LayoutDashboard, Shield, User } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
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

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();

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

            {/* Auth buttons */}
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <span className="text-sm font-bold">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-sm text-gray-500 truncate">
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
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                      Log In
                    </Button>
                    <Button onClick={() => router.push('/auth/signup')}>
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
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

                  {/* Mobile auth */}
                  {!isLoading && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mt-2" />
                      {user ? (
                        <>
                          <div className="flex items-center gap-2 px-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {profile?.display_name || user.email}
                            </span>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="text-lg font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          {profile?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setOpen(false)}
                              className="text-lg font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Admin
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOpen(false);
                              signOut();
                            }}
                            className="gap-2 w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOpen(false);
                              router.push('/auth/login');
                            }}
                            className="w-full"
                          >
                            Log In
                          </Button>
                          <Button
                            onClick={() => {
                              setOpen(false);
                              router.push('/auth/signup');
                            }}
                            className="w-full"
                          >
                            Sign Up
                          </Button>
                        </>
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
