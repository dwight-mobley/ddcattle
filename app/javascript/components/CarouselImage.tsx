import React, { useState } from 'react';

function CarouselImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-neutral-100">
      {/* Skeleton Loader - Displays until image finishes downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy" // Crucial: Tells the browser only to download this image when it scrolls into view
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default CarouselImage