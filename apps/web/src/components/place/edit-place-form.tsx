'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TagInput } from '@/components/ui/tag-input';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { csrfFetch } from '@/lib/csrf-client';
import type { PriceRange, Place } from '@/types/place';

interface FormData {
  // Basic Information
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;

  // Media
  coverImageUrl: string;
  logoUrl: string;

  // Business Details
  priceRange: PriceRange;
  cuisineTypes: string[];
  specialties: string[];
  tags: string[];
  amenities: string[];
  paymentMethods: string[];

  // Operating Hours
  mondayOpen: string;
  mondayClose: string;
  mondayClosed: boolean;
  tuesdayOpen: string;
  tuesdayClose: string;
  tuesdayClosed: boolean;
  wednesdayOpen: string;
  wednesdayClose: string;
  wednesdayClosed: boolean;
  thursdayOpen: string;
  thursdayClose: string;
  thursdayClosed: boolean;
  fridayOpen: string;
  fridayClose: string;
  fridayClosed: boolean;
  saturdayOpen: string;
  saturdayClose: string;
  saturdayClosed: boolean;
  sundayOpen: string;
  sundayClose: string;
  sundayClosed: boolean;

  // Contributor Info (optional)
  contributorName: string;
  contributorEmail: string;
  contributorGithub: string;
}

interface EditPlaceFormProps {
  place: Place;
  onSuccess?: (prUrl: string) => void;
  onCancel?: () => void;
}

export function EditPlaceForm({ place, onSuccess, onCancel }: EditPlaceFormProps) {
  // Common suggestions for tag inputs
  const cuisineSuggestions = [
    'Filipino', 'Japanese', 'Korean', 'Italian', 'American', 'Chinese',
    'Mexican', 'Thai', 'Vietnamese', 'French', 'Indian', 'Spanish',
    'Mediterranean', 'Fusion', 'Asian', 'International', 'Western'
  ];

  const specialtiesSuggestions = [
    'Sisig', 'Adobo', 'Sinigang', 'Kare-kare', 'Lechon', 'Tapsilog',
    'Ramen', 'Sushi', 'Pizza', 'Pasta', 'Burger', 'Steak',
    'Fried Chicken', 'BBQ', 'Seafood', 'Dimsum', 'Sashimi'
  ];

  const tagsSuggestions = [
    'casual', 'family-friendly', 'date-spot', 'cozy', 'trendy',
    'instagram-worthy', 'budget-friendly', 'study-spot', 'group-friendly',
    'quiet', 'lively', 'romantic', 'aesthetic', 'nostalgic', 'modern'
  ];

  const amenitiesSuggestions = [
    'wifi', 'air-conditioned', 'parking', 'outdoor-seating', 'pet-friendly',
    'delivery', 'takeout', 'power-outlets', 'wheelchair-accessible',
    'smoking-area', 'alcohol-served', 'live-music'
  ];

  const paymentSuggestions = [
    'cash', 'gcash', 'paymaya', 'credit-card', 'debit-card',
    'bank-transfer', 'maya', 'grab-pay'
  ];

  // Convert Place to FormData format
  const getInitialFormData = (): FormData => {
    return {
      name: place.name,
      description: place.description,
      address: place.address,
      phone: place.phone || '',
      email: place.email || '',
      website: place.website || '',
      coverImageUrl: place.coverImageUrl || '',
      logoUrl: place.logoUrl || '',
      priceRange: place.priceRange,
      cuisineTypes: place.cuisineTypes,
      specialties: place.specialties,
      tags: place.tags,
      amenities: place.amenities,
      paymentMethods: place.paymentMethods,
      mondayOpen: place.operatingHours.monday?.open || '10:00',
      mondayClose: place.operatingHours.monday?.close || '22:00',
      mondayClosed: place.operatingHours.monday?.closed || false,
      tuesdayOpen: place.operatingHours.tuesday?.open || '10:00',
      tuesdayClose: place.operatingHours.tuesday?.close || '22:00',
      tuesdayClosed: place.operatingHours.tuesday?.closed || false,
      wednesdayOpen: place.operatingHours.wednesday?.open || '10:00',
      wednesdayClose: place.operatingHours.wednesday?.close || '22:00',
      wednesdayClosed: place.operatingHours.wednesday?.closed || false,
      thursdayOpen: place.operatingHours.thursday?.open || '10:00',
      thursdayClose: place.operatingHours.thursday?.close || '22:00',
      thursdayClosed: place.operatingHours.thursday?.closed || false,
      fridayOpen: place.operatingHours.friday?.open || '10:00',
      fridayClose: place.operatingHours.friday?.close || '23:00',
      fridayClosed: place.operatingHours.friday?.closed || false,
      saturdayOpen: place.operatingHours.saturday?.open || '10:00',
      saturdayClose: place.operatingHours.saturday?.close || '23:00',
      saturdayClosed: place.operatingHours.saturday?.closed || false,
      sundayOpen: place.operatingHours.sunday?.open || '10:00',
      sundayClose: place.operatingHours.sunday?.close || '22:00',
      sundayClosed: place.operatingHours.sunday?.closed || false,
      contributorName: '',
      contributorEmail: '',
      contributorGithub: '',
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form data when place changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [place.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Build operating hours - ensure all open/close times have values
      const operatingHours: Record<string, any> = {
        monday: formData.mondayClosed
          ? { closed: true }
          : { open: formData.mondayOpen || '10:00', close: formData.mondayClose || '22:00' },
        tuesday: formData.tuesdayClosed
          ? { closed: true }
          : { open: formData.tuesdayOpen || '10:00', close: formData.tuesdayClose || '22:00' },
        wednesday: formData.wednesdayClosed
          ? { closed: true }
          : { open: formData.wednesdayOpen || '10:00', close: formData.wednesdayClose || '22:00' },
        thursday: formData.thursdayClosed
          ? { closed: true }
          : { open: formData.thursdayOpen || '10:00', close: formData.thursdayClose || '22:00' },
        friday: formData.fridayClosed
          ? { closed: true }
          : { open: formData.fridayOpen || '10:00', close: formData.fridayClose || '23:00' },
        saturday: formData.saturdayClosed
          ? { closed: true }
          : { open: formData.saturdayOpen || '10:00', close: formData.saturdayClose || '23:00' },
        sunday: formData.sundayClosed
          ? { closed: true }
          : { open: formData.sundayOpen || '10:00', close: formData.sundayClose || '22:00' },
      };

      // Build request payload with place ID and slug
      const payload = {
        id: place.id,
        slug: place.slug,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        logoUrl: formData.logoUrl || undefined,
        photosUrls: place.photosUrls || [], // Keep existing photos
        operatingHours,
        priceRange: formData.priceRange,
        paymentMethods: formData.paymentMethods,
        cuisineTypes: formData.cuisineTypes,
        specialties: formData.specialties,
        tags: formData.tags,
        amenities: formData.amenities,
        latitude: place.latitude,
        longitude: place.longitude,
        contributorName: formData.contributorName || undefined,
        contributorEmail: formData.contributorEmail || undefined,
        contributorGithub: formData.contributorGithub || undefined,
      };

      const response = await csrfFetch('/api/places/update-pr', {
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit your changes. Please try again.');
      }

      // Success! Call the onSuccess callback
      if (onSuccess && data.prUrl) {
        onSuccess(data.prUrl);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Rodic's Diner"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="Brief description of the place (minimum 10 characters)"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="e.g., 60 Maginhawa St, Diliman, Quezon City"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+63 123 456 7890"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@restaurant.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1">
              Website or Facebook Page
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.restaurant.com or https://facebook.com/page"
            />
          </div>
        </div>
      </Card>

      {/* Business Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Business Details</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium mb-1">
              Price Range <span className="text-red-500">*</span>
            </label>
            <select
              id="priceRange"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="$">$ - Budget (₱100-200)</option>
              <option value="$$">$$ - Moderate (₱200-500)</option>
              <option value="$$$">$$$ - Upscale (₱500-1000)</option>
              <option value="$$$$">$$$$ - Fine Dining (₱1000+)</option>
            </select>
          </div>

          <div>
            <label htmlFor="cuisineTypes" className="block text-sm font-medium mb-2">
              Cuisine Types <span className="text-red-500">*</span>
            </label>
            <TagInput
              value={formData.cuisineTypes}
              onChange={(tags) => setFormData({ ...formData, cuisineTypes: tags })}
              placeholder="e.g., Filipino, Japanese, Italian"
              suggestions={cuisineSuggestions}
            />
          </div>

          <div>
            <label htmlFor="specialties" className="block text-sm font-medium mb-2">
              Specialties / Signature Dishes
            </label>
            <TagInput
              value={formData.specialties}
              onChange={(tags) => setFormData({ ...formData, specialties: tags })}
              placeholder="e.g., Sisig, Ramen, Pizza"
              suggestions={specialtiesSuggestions}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags
            </label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags: tags })}
              placeholder="e.g., casual, family-friendly, cozy"
              suggestions={tagsSuggestions}
            />
          </div>

          <div>
            <label htmlFor="amenities" className="block text-sm font-medium mb-2">
              Amenities
            </label>
            <TagInput
              value={formData.amenities}
              onChange={(tags) => setFormData({ ...formData, amenities: tags })}
              placeholder="e.g., wifi, parking, air-conditioned"
              suggestions={amenitiesSuggestions}
            />
          </div>

          <div>
            <label htmlFor="paymentMethods" className="block text-sm font-medium mb-2">
              Payment Methods
            </label>
            <TagInput
              value={formData.paymentMethods}
              onChange={(tags) => setFormData({ ...formData, paymentMethods: tags })}
              placeholder="e.g., cash, gcash, credit-card"
              suggestions={paymentSuggestions}
            />
          </div>
        </div>
      </Card>

      {/* Operating Hours */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
        <div className="space-y-3">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
            const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
            const openField = `${day}Open` as keyof FormData;
            const closeField = `${day}Close` as keyof FormData;
            const closedField = `${day}Closed` as keyof FormData;

            return (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <span className="text-sm font-medium">{dayCapitalized}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    name={openField}
                    value={formData[openField] as string}
                    onChange={handleChange}
                    disabled={formData[closedField] as boolean}
                    className="w-32"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    name={closeField}
                    value={formData[closeField] as string}
                    onChange={handleChange}
                    disabled={formData[closedField] as boolean}
                    className="w-32"
                  />
                  <label className="flex items-center gap-2 ml-4">
                    <input
                      type="checkbox"
                      name={closedField}
                      checked={formData[closedField] as boolean}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Media */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Photos</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload high-quality images to showcase your place. Images will be automatically compressed and optimized.
        </p>
        <div className="space-y-6">
          <ImageUploadField
            type="cover"
            value={formData.coverImageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, coverImageUrl: url }))}
            slug={place.slug}
            label="Cover Photo"
            description="Wide cover photo (recommended: 1920x1080px, 16:9 aspect ratio)"
            aspect={16 / 9}
            required={false}
          />

          <ImageUploadField
            type="profile"
            value={formData.logoUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
            slug={place.slug}
            label="Profile Photo / Logo"
            description="Square profile photo or logo (recommended: 800x800px, 1:1 aspect ratio)"
            aspect={1}
            required={false}
          />
        </div>
      </Card>

      {/* Contributor Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Help us give you credit for your contribution!
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="contributorName" className="block text-sm font-medium mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="contributorName"
              name="contributorName"
              value={formData.contributorName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="contributorEmail" className="block text-sm font-medium mb-1">
              Your Email (Optional)
            </label>
            <Input
              id="contributorEmail"
              name="contributorEmail"
              type="email"
              value={formData.contributorEmail}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="contributorGithub" className="block text-sm font-medium mb-1">
              Your Social Media Handle (Optional)
            </label>
            <Input
              id="contributorGithub"
              name="contributorGithub"
              value={formData.contributorGithub}
              onChange={handleChange}
              placeholder="@johndoe"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Twitter, Instagram, or any social media handle
            </p>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Changes'}
        </Button>
      </div>
    </form>
  );
}
