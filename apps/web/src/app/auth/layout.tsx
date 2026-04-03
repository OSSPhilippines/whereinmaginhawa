import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <MapPin className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl text-gray-900">
          Where In Maginhawa
        </span>
      </Link>
      {children}
    </div>
  );
}
