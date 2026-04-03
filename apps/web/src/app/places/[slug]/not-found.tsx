import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, Store } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Store className="w-12 h-12 text-muted-foreground/40" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Place Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the place you&apos;re looking for. It may have been removed or the link might be incorrect.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button className="gap-2 rounded-full">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/places">
            <Button variant="outline" className="gap-2 rounded-full">
              <Search className="w-4 h-4" />
              Browse Places
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
