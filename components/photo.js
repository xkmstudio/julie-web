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
  fill: fillProp = false,
  className,
  force = false,
}) => {
  if (!photo?.asset) return null

  const imageRef = useRef()
  const useFill = fillProp || layout === 'fill' || layout === 'contain'

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
        { 'w-auto max-w-full': layout === 'natural' },
        { 'h-full w-[auto]': layout === 'height' },
        {
          'w-full md:h-full md:object-cover md:absolute md:left-0 md:top-0 h-[auto]':
            layout === 'thumb',
        },
        {
          'h-full w-full object-cover absolute left-0 top-0': layout === 'fill',
        },
        {
          'h-full w-full object-contain absolute left-0 top-0': layout === 'contain',
        }
      )}
    >
      <Image
        ref={imageRef}
        src={src}
        srcSet={srcSet}
        width={!useFill ? width || photo.width : undefined}
        height={!useFill ? height || photo.height : undefined}
        sizes={useFill ? '100%' : undefined}
        placeholder={photo.lqip ? "blur" : undefined}
        fill={useFill}
        quality={80}
        priority={force}
        className={cx(
          className,
          { 'w-full h-[auto]': layout === 'intrinsic' },
          { 'w-auto max-w-full h-auto': layout === 'natural' },
          { 'h-full w-[auto]': layout === 'height' },
          {
            'w-full md:h-full md:object-cover md:absolute md:left-0 md:top-0 h-[auto]':
              layout === 'thumb',
          },
          {
            'h-full w-full object-cover absolute left-0 top-0':
              layout === 'fill',
          },
          {
            'h-full w-full object-contain absolute left-0 top-0':
              layout === 'contain',
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
