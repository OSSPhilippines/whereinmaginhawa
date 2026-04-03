'use client';

import { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Utensils, CreditCard, User, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagInput } from '@/components/ui/tag-input';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { csrfFetch } from '@/lib/csrf-client';
import { toast } from 'sonner';
import type { PriceRange, Place } from '@/types/place';

interface FormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  coverImageUrl: string;
  logoUrl: string;
  priceRange: PriceRange;
  cuisineTypes: string[];
  specialties: string[];
  tags: string[];
  amenities: string[];
  paymentMethods: string[];
  mondayOpen: string; mondayClose: string; mondayClosed: boolean;
  tuesdayOpen: string; tuesdayClose: string; tuesdayClosed: boolean;
  wednesdayOpen: string; wednesdayClose: string; wednesdayClosed: boolean;
  thursdayOpen: string; thursdayClose: string; thursdayClosed: boolean;
  fridayOpen: string; fridayClose: string; fridayClosed: boolean;
  saturdayOpen: string; saturdayClose: string; saturdayClosed: boolean;
  sundayOpen: string; sundayClose: string; sundayClosed: boolean;
  contributorName: string;
  contributorEmail: string;
  contributorGithub: string;
}

interface EditPlaceFormProps {
  place: Place;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultContributor?: { name: string; email: string } | null;
}

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

const steps = [
  { id: 'basics', label: 'Basics', icon: Utensils },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'details', label: 'Details', icon: CreditCard },
  { id: 'you', label: 'About You', icon: User },
];

function getInitialFormData(place: Place, defaultContributor?: { name: string; email: string } | null): FormData {
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
    contributorName: defaultContributor?.name ?? '',
    contributorEmail: defaultContributor?.email ?? '',
    contributorGithub: '',
  };
}

export function EditPlaceForm({ place, onSuccess, onCancel, defaultContributor }: EditPlaceFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(getInitialFormData(place, defaultContributor));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(place, defaultContributor));
  }, [place.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const stepValidation: Record<number, () => boolean> = {
    0: () => formData.name.trim().length > 0 && formData.description.trim().length >= 10 && formData.cuisineTypes.length > 0,
    1: () => true,
    2: () => formData.address.trim().length > 0,
    3: () => true,
    4: () => true,
    5: () => formData.contributorName.trim().length > 0,
  };

  const isCurrentStepValid = stepValidation[currentStep]?.() ?? true;
  const isLastStep = currentStep === steps.length - 1;

  function goNext() {
    if (isCurrentStepValid && !isLastStep) setCurrentStep((s) => s + 1);
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  const handleSubmit = async () => {
    if (!isCurrentStepValid) return;
    setIsSubmitting(true);
    try {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const operatingHours: Record<string, { open?: string; close?: string; closed?: boolean }> = {};
      for (const day of days) {
        const closed = formData[`${day}Closed` as keyof FormData] as boolean;
        operatingHours[day] = closed
          ? { closed: true }
          : { open: (formData[`${day}Open` as keyof FormData] as string) || '10:00', close: (formData[`${day}Close` as keyof FormData] as string) || '22:00' };
      }

      const payload = {
        placeId: place.id,
        id: place.id,
        slug: place.slug,
        name: formData.name, description: formData.description, address: formData.address,
        phone: formData.phone || undefined, email: formData.email || undefined, website: formData.website || undefined,
        coverImageUrl: formData.coverImageUrl || undefined, logoUrl: formData.logoUrl || undefined,
        photosUrls: place.photosUrls || [], operatingHours, priceRange: formData.priceRange,
        paymentMethods: formData.paymentMethods, cuisineTypes: formData.cuisineTypes,
        specialties: formData.specialties, tags: formData.tags, amenities: formData.amenities,
        latitude: place.latitude, longitude: place.longitude,
        contributorName: formData.contributorName || undefined,
        contributorEmail: formData.contributorEmail || undefined,
        contributorGithub: formData.contributorGithub || undefined,
      };

      const response = await csrfFetch('/api/suggestions', {
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.details) {
          const errors: string[] = [];
          const extract = (obj: Record<string, unknown>, prefix = '') => {
            const errs = obj._errors as string[] | undefined;
            if (errs?.length) errors.push(`${prefix}: ${errs.join(', ')}`);
            for (const [key, val] of Object.entries(obj)) {
              if (key !== '_errors' && typeof val === 'object' && val) extract(val as Record<string, unknown>, prefix ? `${prefix}.${key}` : key);
            }
          };
          extract(data.details);
          toast.error('Validation Failed', { description: errors.join('\n') || 'Please check all required fields.', duration: 6000 });
        } else {
          toast.error('Submission Failed', { description: data.error || 'Please check all fields and try again.', duration: 5000 });
        }
        return;
      }
      toast.success('Changes Submitted!', { description: data.message || 'Your suggested changes will be reviewed.', duration: 4000 });
      onSuccess?.();
    } catch (err) {
      console.info('[edit-place] Submit error:', err);
      toast.error('Unexpected Error', { description: err instanceof Error ? err.message : 'Please try again.', duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper header */}
      <nav className="relative" aria-label="Form progress">
        <div className="absolute top-5 left-0 right-0 h-px bg-border hidden sm:block" style={{ marginLeft: '2.5rem', marginRight: '2.5rem' }} />
        <div
          className="absolute top-5 left-0 h-px bg-primary transition-all duration-500 hidden sm:block"
          style={{
            marginLeft: '2.5rem',
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 5rem * ${currentStep / (steps.length - 1)})`,
          }}
        />
        <ol className="relative flex justify-between">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <li key={step.id} className="flex flex-col items-center z-10">
                <button
                  type="button"
                  onClick={() => { if (i <= currentStep) setCurrentStep(i); }}
                  disabled={i > currentStep}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    isComplete ? 'bg-primary text-primary-foreground'
                    : isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                  } ${i <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </button>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="min-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 0 && <StepBasics formData={formData} handleChange={handleChange} setFormData={setFormData} />}
            {currentStep === 1 && <StepPhotos formData={formData} setFormData={setFormData} slug={place.slug} />}
            {currentStep === 2 && <StepLocation formData={formData} handleChange={handleChange} />}
            {currentStep === 3 && <StepHours formData={formData} handleChange={handleChange} />}
            {currentStep === 4 && <StepDetails formData={formData} setFormData={setFormData} />}
            {currentStep === 5 && <StepContributor formData={formData} handleChange={handleChange} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="ghost" onClick={goBack} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground">Cancel</Button>
            ) : <div />}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{currentStep + 1} of {steps.length}</span>
            {isLastStep ? (
              <Button type="button" onClick={handleSubmit} disabled={!isCurrentStepValid || isSubmitting} className="rounded-full px-8">
                {isSubmitting ? 'Submitting...' : 'Submit Changes'}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={!isCurrentStepValid} className="gap-2 rounded-full px-6">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {isLastStep && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            By submitting, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms</a> and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
            Your changes will be reviewed before publishing.
          </p>
        )}
      </div>
    </div>
  );
}

/* ==================== Step Components ==================== */

interface StepProps {
  formData: FormData;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
  slug?: string;
}

function StepHeader({ icon: Icon, label, title, description }: { icon: typeof Camera; label: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{label}</span>
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function StepBasics({ formData, handleChange, setFormData }: StepProps) {
  return (
    <div>
      <StepHeader icon={Utensils} label="Step 1" title="Basic information" description="Update the essentials about this place." />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Restaurant Name <span className="text-destructive">*</span></label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., The Green Kitchen" />
          </div>
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium mb-1">Price Range <span className="text-destructive">*</span></label>
            <select id="priceRange" name="priceRange" value={formData.priceRange} onChange={handleChange} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
              <option value="$">$ - Budget</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Upscale</option>
              <option value="$$$$">$$$$ - Fine Dining</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Short Description <span className="text-destructive">*</span></label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none" placeholder="What makes this place special?" />
          <p className={`text-xs mt-1 ${formData.description.length >= 10 ? 'text-emerald' : 'text-muted-foreground'}`}>{formData.description.length}/10 min characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cuisine Types <span className="text-destructive">*</span></label>
          <TagInput value={formData.cuisineTypes} onChange={(tags) => setFormData!((p) => ({ ...p, cuisineTypes: tags }))} placeholder="e.g., Filipino, Japanese" suggestions={cuisineSuggestions} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Specialties / Signature Dishes</label>
          <TagInput value={formData.specialties} onChange={(tags) => setFormData!((p) => ({ ...p, specialties: tags }))} placeholder="e.g., Sisig, Ramen" suggestions={specialtiesSuggestions} />
        </div>
      </div>
    </div>
  );
}

function StepPhotos({ formData, setFormData, slug }: StepProps) {
  return (
    <div>
      <StepHeader icon={Camera} label="Step 2" title="Photos" description="Update the cover photo and logo." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadField type="cover" value={formData.coverImageUrl} onChange={(url) => setFormData!((prev) => ({ ...prev, coverImageUrl: url }))} slug={slug!} label="Cover Photo" description="Wide photo (16:9 ratio)" aspect={16 / 9} required={false} />
        <ImageUploadField type="profile" value={formData.logoUrl} onChange={(url) => setFormData!((prev) => ({ ...prev, logoUrl: url }))} slug={slug!} label="Logo / Profile" description="Square image (1:1 ratio)" aspect={1} required={false} />
      </div>
    </div>
  );
}

function StepLocation({ formData, handleChange }: StepProps) {
  return (
    <div>
      <StepHeader icon={MapPin} label="Step 3" title="Location & contact" description="Update address and contact details." />
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address <span className="text-destructive">*</span></label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Maginhawa St." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+63 XXX XXX XXXX" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="hello@restaurant.com" />
          </div>
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">Website or Facebook Page</label>
          <Input id="website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://" />
        </div>
      </div>
    </div>
  );
}

function StepHours({ formData, handleChange }: StepProps) {
  return (
    <div>
      <StepHeader icon={Clock} label="Step 4" title="Operating hours" description="Update when this place is open." />
      <div className="space-y-2">
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
          const open = `${day}Open` as keyof FormData;
          const close = `${day}Close` as keyof FormData;
          const closed = `${day}Closed` as keyof FormData;
          return (
            <div key={day} className="flex items-center gap-3 py-1.5">
              <span className="w-20 text-sm font-medium capitalize">{day.slice(0, 3)}</span>
              <Input type="time" name={open} value={formData[open] as string} onChange={handleChange} disabled={formData[closed] as boolean} className="w-28 text-sm" />
              <span className="text-xs text-muted-foreground">to</span>
              <Input type="time" name={close} value={formData[close] as string} onChange={handleChange} disabled={formData[closed] as boolean} className="w-28 text-sm" />
              <label className="flex items-center gap-1.5 ml-2 cursor-pointer">
                <input type="checkbox" name={closed} checked={formData[closed] as boolean} onChange={handleChange} className="rounded" />
                <span className="text-xs text-muted-foreground">Closed</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepDetails({ formData, setFormData }: StepProps) {
  return (
    <div>
      <StepHeader icon={CreditCard} label="Step 5" title="Tags, amenities & payment" description="Help people find this place with the right filters." />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <TagInput value={formData.tags} onChange={(tags) => setFormData!((p) => ({ ...p, tags }))} placeholder="e.g., casual, cozy" suggestions={tagsSuggestions} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <TagInput value={formData.amenities} onChange={(tags) => setFormData!((p) => ({ ...p, amenities: tags }))} placeholder="e.g., wifi, parking" suggestions={amenitiesSuggestions} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment Methods</label>
          <TagInput value={formData.paymentMethods} onChange={(tags) => setFormData!((p) => ({ ...p, paymentMethods: tags }))} placeholder="e.g., cash, gcash" suggestions={paymentSuggestions} />
        </div>
      </div>
    </div>
  );
}

function StepContributor({ formData, handleChange }: StepProps) {
  return (
    <div>
      <StepHeader icon={User} label="Step 6" title="About you" description="Help us give you credit for your contribution." />
      <div className="space-y-4">
        <div>
          <label htmlFor="contributorName" className="block text-sm font-medium mb-1">Your Name <span className="text-destructive">*</span></label>
          <Input id="contributorName" name="contributorName" value={formData.contributorName} onChange={handleChange} placeholder="Juan Dela Cruz" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contributorEmail" className="block text-sm font-medium mb-1">Your Email</label>
            <Input id="contributorEmail" name="contributorEmail" type="email" value={formData.contributorEmail} onChange={handleChange} placeholder="juan@example.com" />
          </div>
          <div>
            <label htmlFor="contributorGithub" className="block text-sm font-medium mb-1">Social Media Handle</label>
            <Input id="contributorGithub" name="contributorGithub" value={formData.contributorGithub} onChange={handleChange} placeholder="@juandelacruz" />
          </div>
        </div>
      </div>
    </div>
  );
}
