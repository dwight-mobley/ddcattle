import React from "react";

const IMAGE_SIZES = {
  thumbnail: {
    width: 300,
    quality: 70,
  },
  card: {
    width: 600,
    quality: 75,
  },
  gallery: {
    width: 1200,
    quality: 100,
  },
};

function getImageUrl(src, size = "card") {
  if (!src) return null;

  if (size === "original") {
    return src;
  }

  const settings = IMAGE_SIZES[size] || IMAGE_SIZES.card;

  const transformations = [
    `width=${settings.width}`,
    `quality=${settings.quality}`,
    "format=auto",
  ].join(",");

  const url = new URL(src);

  return `${url.origin}/cdn-cgi/image/${transformations}${url.pathname}`;
}

export default function AnimalImage({
  src,
  alt = "",
  size = "card",
  className = "",
  ...props
}) {
  const imageUrl = getImageUrl(src, size);

  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}