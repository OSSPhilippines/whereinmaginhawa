'use client';

interface PlaceImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackContent?: React.ReactNode;
}

export function PlaceImage({ src, alt, className, fallbackContent }: PlaceImageProps) {
  if (!src) {
    return <>{fallbackContent}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
