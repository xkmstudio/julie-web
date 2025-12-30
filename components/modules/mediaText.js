import React, { useRef, useEffect, useState, useCallback } from 'react'

import { AnimatePresence, m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import Media from '@components/media'
import BlockContent from '@components/block-content'
import Link from '@components/link'

const MediaText2Up = ({ data = {} }) => {
  const { media, title, subtitle, content, config, cta } = data



  return (
    <section className="section-padding relative my-90 md:my-120 z-2">
      <div
        key="content"
        className={`relative z-2 w-full flex gap-15 md:gap-25 items flex-col${
          config == 'imageLeft' ? ' md:flex-row' : ' md:flex-row-reverse'
        }`}
      >
        <div className={`w-full md:w-[66.6667%] relative`}>
          <div className="w-full pb-[100%] md:pb-[60%] relative">
            <Media
              className={
                'w-full h-full object-cover rounded-[2rem] overflow-hidden absolute top-0 left-0'
              }
              isSlide={true}
              layout="fill"
              media={media.content}
            />
          </div>
        </div>
        <div
          className={`w-full md:flex-1 flex justify-center items-center mt-15 m:mt-0${
            config == 'imageLeft' ? ' col-start-6' : ' col-start-1'
          }`}
        >
          <div
            className={`w-full max-w-[55rem] mx-auto flex flex-col items-center text-center md:px-10`}
          >
            {subtitle && (
              <div className="font-plaid text-16 md:text-16 uppercase tracking-[-.02em] leading-100 mb-25">
                {subtitle}
              </div>
            )}
            {title && (
              <h2 className="title-2xl w-full mb-25">
                {title}
              </h2>
            )}
            {content && (
              <div className="mt-20 w-full">
                <BlockContent blocks={content} />
              </div>
            )}
            {cta && (
              <Link
                className="flex items-center justify-center btn mt-20"
                link={cta}
                hasArrow={false}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MediaText2Up
