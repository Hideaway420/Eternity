import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  /** Set on the LCP image only (the homepage hero). Everything else lazy-loads. */
  priority?: boolean;
  /** Responsive size hint. Grids are 2-up on mobile, 4-up from md. */
  sizes?: string;
  className?: string;
}

/**
 * ponytail: thin wrapper so the whole storefront gets AVIF/WebP, srcset and lazy loading
 * without auditing 20 call sites individually. Before this, next/image was used zero times
 * and the remotePatterns config in next.config.ts was dead.
 *
 * The escape hatch matters: /api/admin/upload-image falls back to a base64 data: URL when
 * the filesystem is read-only (Vercel), and next/image cannot optimize a data: URL.
 * Those fall through to a plain <img> rather than throwing at render time.
 *
 * Callers must supply their own positioned, overflow-hidden wrapper (the existing
 * `aspect-square overflow-hidden` blocks already do), because this renders with `fill`.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className = "w-full h-full object-cover",
}: ProductImageProps) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
