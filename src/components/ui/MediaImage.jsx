import React, { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "../../utils/media";

export default function MediaImage({ src, fallbackSrc = "", alt = "", onError, ...props }) {
  const primarySrc = useMemo(() => resolveMediaUrl(src), [src]);
  const fallbackResolved = useMemo(() => {
    const original = resolveMediaUrl(src, { preferHighRes: false });
    if (original && original !== primarySrc) return original;

    const extraFallback = resolveMediaUrl(fallbackSrc, { preferHighRes: false });
    if (extraFallback && extraFallback !== primarySrc) return extraFallback;

    return "";
  }, [fallbackSrc, primarySrc, src]);

  const [currentSrc, setCurrentSrc] = useState(primarySrc || fallbackResolved || "");

  useEffect(() => {
    setCurrentSrc(primarySrc || fallbackResolved || "");
  }, [fallbackResolved, primarySrc]);

  if (!currentSrc) return null;

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (fallbackResolved && currentSrc !== fallbackResolved) {
          setCurrentSrc(fallbackResolved);
        }
        onError?.(event);
      }}
    />
  );
}
