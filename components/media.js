import React from 'react'

import Video from '@components/video-lazy'
import VideoPlayer from '@components/video-player'
import Vimeo from '@components/vimeo-lazy'
import Photo from '@components/photo'

const Media = ({
  media,
  isSlide,
  className,
  crop,
  layout = 'fill',
  width = 1600,
  srcSizes,
  setAspect,
  controls,
  force,
}) => {
  
  return (
    <>
      {media?._type == 'video' ? (
        <>
          {media.sections && media.sections.length > 0 ? (
            <VideoPlayer
              src={media.video}
              poster={media.poster}
              posterUrl={media.posterUrl}
              sections={media.sections}
              layout={layout}
              className={className}
              autoplay={!media.autoplayDisabled}
            />
          ) : (
            <Video
              setAspect={setAspect}
              isSlide={isSlide}
              layout={layout}
              className={className}
              src={media.video}
              poster={media.poster}
              posterUrl={media.posterUrl}
              posterAspect={media.posterAspect}
              autoplayDisabled={media.autoplayDisabled}
              controls={controls}
            />
          )}
        </>
      ) : (
        <Photo
          isSlide={isSlide}
          photo={media}
          width={width}
          srcSizes={srcSizes || [800, 1000, 1200, 1600]}
          sizes="100%"
          layout={layout}
          className={className}
          crop={crop}
          force={force}
        />
      )}
    </>
  )
}

export default Media
