'use client';

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddPlaceForm } from './add-place-form';

interface AddPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPlaceDialog({ open, onOpenChange }: AddPlaceDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSuccess = () => {
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmitted(false);
    }, 3000);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-12 text-center">
            <div className="mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="mb-2">Submission Received!</DialogTitle>
            <DialogDescription className="mb-4">
              Your place has been submitted for review.
              <br />
              We&apos;ll review it and add it to the directory soon!
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a New Place</DialogTitle>
              <DialogDescription>
                Submit a new restaurant or café to Where In Maginhawa. Your submission will be
                reviewed before being added to the directory.
              </DialogDescription>
            </DialogHeader>
            <AddPlaceForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
