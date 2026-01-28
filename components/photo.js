import React, { useRef } from 'react'
import cx from 'classnames'
import Image from 'next/image'

import { buildSrcSet, buildSrc } from '@lib/helpers'

const Photo = ({
  photo,
  width,
  height,
  srcSizes = [400, 600, 800, 1000, 1200],
  layout = 'intrinsic',
  quality = 100,
  fill = false,
  className,
  force = false,
}) => {
  if (!photo?.asset) return null

  const imageRef = useRef()

  // Define our src and srcset
  const src = buildSrc(photo, {
    width,
    height,
    quality,
    format: 'webp', // Force Next-Gen format
  })

  const srcSet = buildSrcSet(photo, {
    srcSizes: srcSizes,
    quality,
    format: 'webp', // Force Next-Gen format
  })

  return (
    <div
      className={cx(
        className,
        { 'w-full': layout === 'intrinsic' },
        { 'h-full w-[auto]': layout === 'height' },
        {
          'w-full md:h-full md:object-cover md:absolute md:left-0 md:top-0 h-[auto]':
            layout === 'thumb',
        },
        {
          'h-full w-full object-cover absolute left-0 top-0': layout === 'fill',
        }
      )}
    >
      <Image
        ref={imageRef}
        src={src}
        srcSet={srcSet}
        width={!fill ? width || photo.width : undefined}
        height={!fill ? height || photo.height : undefined}
        sizes={srcSizes}
        placeholder={photo.lqip ? "blur" : undefined}
        fill={fill}
        quality={80}
        priority={force}
        className={cx(
          className,
          { 'w-full h-[auto]': layout === 'intrinsic' },
          { 'h-full w-[auto]': layout === 'height' },
          {
            'w-full md:h-full md:object-cover md:absolute md:left-0 md:top-0 h-[auto]':
              layout === 'thumb',
          },
          {
            'h-full w-full object-cover absolute left-0 top-0':
              layout === 'fill',
          }
        )}
        alt={photo.asset?.altText || 'Julie'}
        blurDataURL={photo.lqip}
        loading={force ? 'eager' : 'lazy'} // Prevent lazy loading if force is true
      />
    </div>
  )
}

export default Photo
