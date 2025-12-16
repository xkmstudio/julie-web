import React from 'react'

import VideoPlayer from '@components/video-player'

const MediaTutorial = ({ data = {} }) => {
  const { videoTutorial } = data

  if (!videoTutorial) return null

  return (
    <section className={`mx-auto relative px-10 md:px-15`}>
      {videoTutorial._type === 'videoTutorial' ? (
        <VideoPlayer
          src={videoTutorial.video}
          poster={videoTutorial.poster}
          posterUrl={videoTutorial.posterUrl}
          sections={videoTutorial.sections || []}
          layout={'intrinsic'}
          className={'w-full'}
          autoplay={!videoTutorial.autoplayDisabled}
        />
      ) : null}
    </section>
  )
}

export default MediaTutorial

