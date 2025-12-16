import React, { useRef } from 'react'

import Media from '@components/media'
import BlockContent from '@components/block-content'

const Hero = ({ data = {} }) => {
  const { backgroundMedia, title, subtitle } = data

  return (
    <div className="w-full h-screen max-h-[60rem] relative mb-15">
      <div className="w-full h-full absolute top-0 left-0 z-1">
        <div className="w-full h-full bg-black">
          <Media
            width={1600}
            srcSizes={[800, 1000, 1200, 1600]}
            sizes="100%"
            layout={'fill'}
            className={'absolute top-0 left-0 h-full w-full object-cover'}
            media={backgroundMedia?.content}
          />
        </div>
      </div>
      <div className="absolute z-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-20 w-full max-w-[78rem] px-20 text-white text-center">
        <div className="flex flex-col gap-25">
          <h1 className="title-2xl">
            <BlockContent blocks={title} />
          </h1>
          {subtitle && (
            <div className="">
              <BlockContent blocks={subtitle} />
              
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Hero
