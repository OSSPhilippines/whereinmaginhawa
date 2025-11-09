'use client';

import { useState } from 'react';
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
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const handleSuccess = (prUrl: string) => {
    setSuccessUrl(prUrl);
    // Redirect to the PR after a short delay to show success message
    setTimeout(() => {
      window.open(prUrl, '_blank');
      onOpenChange(false);
      setSuccessUrl(null);
    }, 2000);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {successUrl ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">🎉</div>
            <DialogTitle className="mb-2">Success!</DialogTitle>
            <DialogDescription className="mb-4">
              Your pull request has been created successfully!
              <br />
              Redirecting to GitHub...
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
