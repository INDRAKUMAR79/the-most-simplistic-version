import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ProductImage({
  src,
  alt,
  className = '',
  fallbackLabel,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface-subtle text-on-surface-muted p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <span
          className="material-symbols-outlined text-headline-lg mb-1"
          aria-hidden="true"
        >
          inventory_2
        </span>
        <span className="font-label text-label-sm line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
