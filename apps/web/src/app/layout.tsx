import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://whereinmaginhawa.com'),
  title: {
    default: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    template: "%s | Where In Maginhawa",
  },
  description: "Discover the best restaurants, cafés, and food spots on Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Your ultimate guide to dining with 225+ places to explore.",
  keywords: [
    "Maginhawa Street",
    "Maginhawa restaurants",
    "Quezon City food",
    "Teacher's Village",
    "Manila restaurants",
    "Philippines dining",
    "QC cafes",
    "Maginhawa food guide",
    "best restaurants Maginhawa",
    "where to eat Maginhawa",
  ],
  authors: [{ name: "Where In Maginhawa" }],
  creator: "Where In Maginhawa",
  publisher: "Where In Maginhawa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/ms-icon-144x144.png',
  },
  openGraph: {
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Discover the best restaurants, cafés, and food spots on Maginhawa Street and nearby areas in Teacher's Village, Quezon City. Your ultimate guide to dining with 225+ places to explore.",
    url: "https://whereinmaginhawa.com",
    siteName: "Where In Maginhawa",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Where In Maginhawa - Discover Maginhawa Street Restaurants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where In Maginhawa | Find the Best Restaurants & Cafés",
    description: "Discover the best restaurants, cafés, and food spots on Maginhawa Street and nearby areas in Teacher's Village, Quezon City.",
    images: ["/og-default.png"],
    creator: "@whereinmaginhawa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteStructuredData />
      </head>
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-center" richColors />
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
