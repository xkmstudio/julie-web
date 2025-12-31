import React, { useRef } from 'react'
import { useIntersection } from 'use-intersection'
import { Marqy } from 'marqy'
import Link from '@components/link'
import NextLink from 'next/link'
import Photo from '@components/photo'

const MarqueeIcon = ({ item, index, className }) => {
  return item.link ? (
    <NextLink
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
      key={index}
    >
      <Photo
        photo={item.icon}
        width={1600}
        srcSizes={[800, 1000, 1200, 1600]}
        sizes="100%"
        layout={'intrinsic'}
        className={className}
      />
    </NextLink>
  ) : (
    <Photo
      key={index}
      photo={item.icon}
      width={1600}
      srcSizes={[800, 1000, 1200, 1600]}
      sizes="100%"
      layout={'intrinsic'}
      className={className}
    />
  )
}

const MarqueeIcons = ({ data = {} }) => {
  const { items, speed, reverse, marquee, pausable, title } = data

  if (!items?.length) return null

  const marqueeRef = useRef()
  const isIntersecting = useIntersection(marqueeRef, {
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={marqueeRef} className="relative w-full flex flex-col gap-50">
      {title && <h2 className="title-2xl w-full text-center max-w-[78rem] mx-auto mb-25">{title}</h2>}
      {marquee ? (
        <div className="relative w-full marquee-section">
          <Marqy
            speed={speed}
            direction={reverse ? 'right' : 'left'}
            pauseOnHover={pausable}
            className="marquee"
          >
            <div className="marquee--item">
              {items.map((item, key) => {
                return (
                  <React.Fragment key={key}>
                    <MarqueeIcon className="h-[5rem]" item={item} index={key} />
                  </React.Fragment>
                )
              })}
            </div>
          </Marqy>
        </div>
      ) : (
        <div className="relative w-full px-15 md:px-25">
          <div className="flex flex-col md:flex-row gap-15 md:gap-50 justify-center items-center">
            {items.map((item, key) => {
              return (
                <MarqueeIcon
                  className="h-[4rem] w-1/2 md:w-[unset]"
                  item={item}
                  index={key}
                />
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default MarqueeIcons
