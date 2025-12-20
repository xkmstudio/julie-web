import React, { useRef } from 'react'
import { useIntersection } from 'use-intersection'
import { Marqy } from 'marqy'
import Link from '@components/link'
import NextLink from 'next/link'
import Photo from '@components/photo'

const Marquee = ({ data = {} }) => {
  const { items, speed, reverse, pausable, title, link, icon } = data

  if (!items?.length) return null

  const marqueeRef = useRef()
  const isIntersecting = useIntersection(marqueeRef, {
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={marqueeRef} className={`relative w-full`}>
      <div className={`${icon ? 'min-h-[35rem] flex items-center justify-center' : ''}`}>
        {link && (
          <div className="marquee-link">
            <div className="bg-pink rounded-full w-full flex items-center justify-center text-white">
              <NextLink href={link.url}>{title}</NextLink>
            </div>
          </div>
        )}
        <div className="marquee-section relative w-full overflow-hidden">
          <Marqy
            speed={speed}
            direction={reverse ? 'right' : 'left'}
            pauseOnHover={false}
            className="marquee"
          >
            <div className="marquee--item">
              {items.map((item, key) => {
                return (
                  <div key={key} className="marquee--text">
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                  </div>
                )
              })}
            </div>
          </Marqy>
        </div>
        {icon && (
          <div className="marquee-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[35rem]">
              <Photo
                photo={icon}
                width={1600}
                srcSizes={[800, 1000, 1200, 1600]}
                sizes="100%"
                layout={'contain'}
                className={'h-full w-full object-contain'}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Marquee
