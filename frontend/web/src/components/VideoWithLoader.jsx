import { useState } from "react";
import Loader from "./Loader";

export default function VideoWithLoader({
  src,
  poster,
  className = "",
  ...props
}) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-desert-sand">
          <Loader fullScreen={false} />
        </div>
      )}

      {/* Video */}
      <video
        src={src}
        poster={poster}
        onLoadedData={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onError={() => setLoading(false)}
        className={`
          h-full
          w-full
          object-cover
          transition-opacity
          duration-500
          ${loading ? "opacity-0" : "opacity-100"}
        `}
        controls
        preload="metadata"
        {...props}
      />
    </div>
  );
}