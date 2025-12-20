import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import Media from '@components/media'
import Link from '@components/link'

const MediaFeature = ({ data = {} }) => {
  const { media, title, link } = data

  if (!media) return null

  console.log('link', link);

  return (
    <section className={`mx-auto relative section-padding`}>
      <div className='w-full pb-[50%] relative rounded-[1.5rem] overflow-hidden flex items-center justify-center'>
        {media && (
          <Media
            media={media?.content}
            width={1600}
            srcSizes={[800, 1000, 1200, 1600]}
            sizes="100%"
            layout={'fill'}
            className={`w-full h-full object-cover absolute top-0 left-0`}
          />
        )}

        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-25 text-white'>
          {title && (
            <h2 className='title-2xl'>{title}</h2>
          )}
  
          {link && (
            <Link className='btn' link={link}/>
          )}
        </div>
      </div>
      
    </section>
  )
}

export default MediaFeature
