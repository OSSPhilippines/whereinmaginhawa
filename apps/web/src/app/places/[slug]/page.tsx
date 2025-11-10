import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CreditCard,
  ChevronLeft,
  ExternalLink,
  Edit3,
  XCircle,
  Image as ImageIcon,
  User,
  Github,
  Mail as MailIcon,
} from 'lucide-react';
import { getPlaceBySlug, getAllPlaces } from '@/lib/places';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceImage } from '@/components/place/place-image';
import { PlaceShare } from '@/components/place/place-share';
import type { Metadata } from 'next';

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const places = getAllPlaces();
  return places.map((place) => ({
    slug: place.slug,
  }));
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return {
      title: 'Place Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whereinmaginhawa.com';
  const pageUrl = `${siteUrl}/places/${place.slug}`;
  const ogImage = place.coverImageUrl || `${siteUrl}/og-default.png`;

  return {
    title: `${place.name} | Where In Maginhawa`,
    description: place.description || 'Discover the best places in Maginhawa',
    icons: place.logoUrl
      ? {
          icon: place.logoUrl,
          apple: place.logoUrl,
        }
      : {
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
        },
    manifest: '/manifest.json',
    themeColor: '#ffffff',
    other: {
      'msapplication-TileColor': '#ffffff',
      'msapplication-TileImage': '/ms-icon-144x144.png',
    },
    openGraph: {
      title: place.name,
      description: place.description || 'Discover the best places in Maginhawa',
      url: pageUrl,
      siteName: 'Where In Maginhawa',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${place.name} - ${place.description}`,
        },
      ],
      locale: 'en_PH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: place.name,
      description: place.description || 'Discover the best places in Maginhawa',
      images: [ogImage],
    },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whereinmaginhawa.com';
  const placeUrl = `${siteUrl}/places/${place.slug}`;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      {/* Header Image */}
      <div className="relative h-[400px] bg-orange-50">
        <PlaceImage
          src={place.coverImageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
          fallbackContent={
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-32 h-32 text-primary opacity-30" />
            </div>
          }
        />

        {/* Gradient overlay for better text/logo visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Back Button */}
        <Link href="/places">
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 left-4 gap-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm z-10"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Profile Photo / Logo */}
        <div className="-mt-32 mb-8 ml-4">
          {place.logoUrl ? (
            <PlaceImage
              src={place.logoUrl}
              alt={`${place.name} logo`}
              className="w-48 h-48 rounded-full object-cover border-4 bg-white border-slate-100 shadow-md"
              fallbackContent={
                <div className="w-48 h-48 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-md">
                  <span className="text-7xl font-bold text-primary">
                    {place.name.charAt(0)}
                  </span>
                </div>
              }
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-md">
              <span className="text-7xl font-bold text-primary">
                {place.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-3xl md:text-4xl font-bold mb-2">
                        {place.name}
                      </CardTitle>

                      {/* Cuisine Types */}
                      <div className="flex gap-2 flex-wrap">
                        {place.cuisineTypes.map((cuisine) => (
                          <Badge key={cuisine} variant="secondary" className="capitalize">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2 font-bold">
                      {place.priceRange}
                    </Badge>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed">{place.description}</p>

                  {/* Specialties */}
                  {place.specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h3>
                      <div className="flex gap-2 flex-wrap">
                        {place.specialties.map((specialty) => (
                          <Badge key={specialty} className="capitalize">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Operating Hours */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(place.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2">
                      <span className="font-medium capitalize text-gray-700">
                        {getDayName(day)}
                      </span>
                      {hours.closed ? (
                        <span className="text-red-600 font-medium">Closed</span>
                      ) : (
                        <span className="text-gray-600">
                          {formatTime(hours.open!)} - {formatTime(hours.close!)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {place.amenities.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {place.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-sm capitalize">{amenity.replace(/-/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contributors */}
            {(place.createdBy || (place.contributors && place.contributors.length > 0)) && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Creator */}
                  {place.createdBy && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">Created by</div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{place.createdBy}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-10">
                        {new Date(place.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contribution Timeline */}
                  {place.contributors && place.contributors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Contribution History
                      </div>
                      <div className="space-y-3">
                        {place.contributors.map((contributor, index) => {
                          const date = new Date(contributor.contributedAt);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });

                          return (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                                {index < place.contributors!.length - 1 && (
                                  <div className="w-px h-full bg-gray-200 mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {contributor.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {contributor.action}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  {formattedDate}
                                </div>
                                {(contributor.email || contributor.github) && (
                                  <div className="flex gap-3 mt-2">
                                    {contributor.email && (
                                      <a
                                        href={`mailto:${contributor.email}`}
                                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                                      >
                                        <MailIcon className="w-3 h-3" />
                                        Email
                                      </a>
                                    )}
                                    {contributor.github && (
                                      <a
                                        href={
                                          contributor.github.startsWith('http')
                                            ? contributor.github
                                            : `https://github.com/${contributor.github}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                                      >
                                        Social Media
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Address</div>
                    <div className="text-sm text-gray-600">{place.address}</div>
                  </div>
                </div>

                {/* Phone */}
                {place.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Phone</div>
                      <a
                        href={`tel:${place.phone}`}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        {place.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {place.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Email</div>
                      <a
                        href={`mailto:${place.email}`}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        {place.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {place.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Website</div>
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Methods */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div className="text-sm font-medium text-gray-700">Payment Methods</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {place.paymentMethods.map((method) => (
                      <Badge key={method} variant="outline" className="capitalize">
                        {method.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <PlaceShare
                    placeName={place.name}
                    placeUrl={placeUrl}
                    description={place.description}
                  />

                  <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="w-full gap-2 border-gray-300 hover:border-primary hover:bg-primary/5"
                  >
                    <Link href={`/places/${place.slug}/edit`}>
                      <Edit3 className="w-4 h-4" />
                      Suggest Changes
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="w-full gap-2 border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50"
                  >
                    <Link href={`/places/${place.slug}/delete`}>
                      <XCircle className="w-4 h-4" />
                      Report Closure
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
