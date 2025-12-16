import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import Media from '@components/media'

const MediaFeature = ({ data = {} }) => {
  const { media, sizeMobile } = data

  if (!media) return null

  return (
    <section data-section="tutorial" className={`mx-auto relative px-10 md:px-15`}>
      {media && (
        <Media
          media={media?.content}
          width={1600}
          srcSizes={[800, 1000, 1200, 1600]}
          sizes="100%"
          layout={'intrinsic'}
          className={`w-full${
            sizeMobile == 'intrinsic' || !sizeMobile ? '' : ' hidden md:block'
          }`}
        />
      )}
      {media && sizeMobile && sizeMobile != 'intrinsic' && (
        <div
          className={`relative md:hidden ${
            sizeMobile == 'square'
              ? 'pb-[100%]'
              : sizeMobile == 'portrait'
              ? 'pb-[150%]'
              : ''
          }`}
        >
          <Media
            media={media?.content}
            width={1600}
            srcSizes={[800, 1000, 1200, 1600]}
            sizes="100%"
            layout={'fill'}
            className={`w-full absolute top-0 left-0 h-full object-cover`}
          />
        </div>
      )}
    </section>
  )
}

export default MediaFeature
