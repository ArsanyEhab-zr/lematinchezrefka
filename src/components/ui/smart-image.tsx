import { useCallback, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { unsplashSrc, unsplashSrcSet } from '@/lib/images'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'

type LoadStatus = 'loading' | 'loaded' | 'error'

type SmartImageProps = {
  photoId: string
  alt: string
  /** Wrapper classes — set the aspect ratio or height here. */
  className?: string
  imgClassName?: string
  sizes?: string
  isPriority?: boolean
}

/** Rounded image with a kraft shimmer while loading and a graceful fallback. */
const ImageContent = ({
  photoId,
  alt,
  className,
  imgClassName,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  isPriority = false,
}: SmartImageProps) => {
  const direct = /^(https:\/\/|data:image\/|\/)/.test(photoId)
  const [status, setStatus] = useState<LoadStatus>('loading')

  // Cached images can finish before React attaches onLoad.
  const handleRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setStatus('loaded')
  }, [])

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-kraft/25', className)}>
      {status === 'loading' && <div aria-hidden="true" className="skeleton absolute inset-0" />}
      {status === 'error' ? (
        <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center text-olive/40">
          <ImageOff className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
        </div>
      ) : (
        <img
          ref={handleRef}
          src={direct ? getOptimizedImageUrl(photoId, { width: 1200 }) : unsplashSrc(photoId, 800)}
          srcSet={direct ? undefined : unsplashSrcSet(photoId)}
          sizes={sizes}
          alt={alt}
          loading={isPriority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'h-full w-full transition-[opacity,transform] duration-700 ease-out',
            imgClassName?.includes('object-contain') ? 'object-contain' : 'object-cover',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}


export const SmartImage = (props: SmartImageProps) => <ImageContent key={props.photoId} {...props} />
