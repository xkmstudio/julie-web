import React from 'react'
import cx from 'classnames'

import Video from '@components/video-lazy'
import Photo from '@components/photo'

const MediaBleed = ({ data = {} }) => {
  const { media, size } = data

  if (!media) return null

  const mediaContent = media?.content

  return (
    <section style={{ padding: size === 'bleed' ? '0px' : null }} className={`mx-auto relative z-4${size === 'bleed' ? ' no-border' : ' px-10 md:px-15'}`}>
      <div className={cx({ 'w-full h-screen relative': size === 'bleed' })}>
        {mediaContent && (
          <>
            {mediaContent._type === 'videoBleed' ? (
              <Video
                setAspect={null}
                isSlide={false}
                layout={size === 'bleed' ? 'fill' : 'intrinsic'}
                className={size === 'bleed' ? 'w-full h-full object-cover' : 'w-full'}
                src={mediaContent.video}
                poster={mediaContent.poster}
                posterUrl={mediaContent.posterUrl}
                posterAspect={mediaContent.posterAspect}
                autoplay={!mediaContent.autoplayDisabled}
                controls={false}
              />
            ) : mediaContent._type === 'asset' ? (
              <Photo
                photo={mediaContent}
                width={1600}
                srcSizes={[800, 1000, 1200, 1600]}
                sizes="100%"
                layout={size === 'bleed' ? 'fill' : 'intrinsic'}
                className={size === 'bleed' ? 'w-full h-full object-cover' : 'w-full'}
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export default MediaBleed

