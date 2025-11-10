import type { Metadata } from 'next';
import { HeroSection } from '@/components/hero/hero-section';

export const metadata: Metadata = {
  title: "Where In Maginhawa | Find the Best Restaurants & Cafés in Maginhawa Street",
  description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Discover 225+ restaurants, cafés, and food spots with detailed information on cuisines, prices, amenities, and more.",
  openGraph: {
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Discover 225+ restaurants and cafés.",
    url: "https://whereinmaginhawa.com",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Where In Maginhawa - Find the Best Restaurants & Cafés in Maginhawa Street",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Your ultimate guide to dining in Maginhawa Street and nearby areas in Teacher's Village, Quezon City.",
    images: ["/og-default.png"],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <HeroSection />
    </main>
  );
}
