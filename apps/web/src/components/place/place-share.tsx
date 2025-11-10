'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface PlaceShareProps {
  placeName: string;
  placeUrl: string;
  description?: string;
}

export function PlaceShare({ placeName, placeUrl, description }: PlaceShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out ${placeName} on Where In Maginhawa!`;
  const shareUrl = placeUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: description || shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="w-full gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
              <Share2 className="w-4 h-4" />
              Share...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Facebook */}
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2 cursor-pointer"
          >
            <Facebook className="w-4 h-4" />
            Share on Facebook
          </a>
        </DropdownMenuItem>

        {/* Twitter/X */}
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2 cursor-pointer"
          >
            <Twitter className="w-4 h-4" />
            Share on X (Twitter)
          </a>
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
