import React, { useRef } from 'react'

import Media from '@components/media'
import BlockContent from '@components/block-content'
import Icon from '@components/icon'
import EmaWidget from '@components/emaWidget'

const Hero = ({ data = {} }) => {
  const { backgroundMedia, title, subtitle, mobileTag, hasEma } = data

  return (
    <div
      className={`hero-bleed w-full flex items-center justify-center relative mb-15${
        mobileTag
          ? ' h-[calc(var(--vh,1vh)*100-6rem)] md:h-screen md:max-h-[60rem]'
          : ' min-h-[100vw] md:min-h-[60rem]'
      }`}
    >
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
      <div
        className={`flex flex-col gap-20 w-full max-w-[78rem] px-20 text-white text-center${
          mobileTag
            ? ' absolute z-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            : ' relative z-2 pt-[calc(var(--headerHeight)+2.5rem)] md:pt-[calc(var(--headerHeight)+2rem)] pb-[4rem]'
        }`}
      >
        <div className="flex flex-col gap-15 md:gap-25">
          <h1 className="title-2xl">
            <BlockContent blocks={title} />
          </h1>
          {subtitle && (
            <div className="text-14 md:text-16">
              <BlockContent blocks={subtitle} />
            </div>
          )}
        </div>
        {hasEma && (
          <div className="mt-20">
            <EmaWidget />
          </div>
        )}
      </div>
      {mobileTag && (
        <div className="relative z-2 bottom-15 left-1/2 -translate-x-1/2 text-white flex items-center justify-center md:hidden">
          <div className="tag-glass">
            <div className="text-14 text-center flex-shrink-0">{mobileTag}</div>
            <div className="w-[1.5rem] flex items-center justify-center flex-shrink-0">
              <Icon name="Arrow Curve" viewBox="0 0 19 14" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hero
