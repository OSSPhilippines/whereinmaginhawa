import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  CreditCard,
  ChevronLeft,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { getPlaceBySlug, getAllPlaces } from '@/lib/places';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceImage } from '@/components/place/place-image';
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

  return {
    title: `${place.name} | Where In Maginhawa`,
    description: place.description,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

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
              <span className="text-9xl font-bold text-primary opacity-50">
                {place.name.charAt(0)}
              </span>
            </div>
          }
        />

        {/* Back Button */}
        <Link href="/places">
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 left-4 gap-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-20 relative z-10">
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
                          {formatTime(hours.open)} - {formatTime(hours.close)}
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

                {/* Report Issue Button */}
                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="w-full gap-2 border-gray-300 hover:border-primary hover:bg-primary/5"
                >
                  <a
                    href={`https://forms.gle/pu9VjrG7JNkYmm9K9?entry.123456789=${encodeURIComponent(place.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Report Outdated Information
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
