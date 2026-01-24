import React, { useRef, useState, useEffect } from 'react'
import { useIntersection } from 'use-intersection'
import { Marqy } from 'marqy'
import NextLink from 'next/link'
import Photo from '@components/photo'
import Lottie from 'lottie-react'
import { getPageUrl } from '@components/link'
const Marquee = ({ data = {} }) => {
  const { items, speed, reverse, pausable, title, link, icon } = data
  const [butterflyAnimation, setButterflyAnimation] = useState(null)

  useEffect(() => {
    fetch('/lottie/butterfly.json')
      .then((res) => res.json())
      .then((data) => setButterflyAnimation(data))
      .catch((err) => console.error('Error loading butterfly animation:', err))
  }, [])

  if (!items?.length) return null

  const marqueeRef = useRef()
  const isIntersecting = useIntersection(marqueeRef, {
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={marqueeRef} className={`relative w-full`}>
      <div className={`text-pink${link ? ' transition-colors duration-300 hover:text-magenta' : ''}${icon ? ' min-h-[28rem] md:min-h-[35rem] flex flex-col md:flex-row items-center justify-center' : ' flex flex-col md:flex-row items-center gap-20 md:gap-0'}`}>
        {link && !icon && (
          <div className="marquee-link flex items-center justify-center relative pointer-events-none md:bg-white">
            {butterflyAnimation && (
              <div className="relative md:absolute w-full max-w-[15rem] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 blur-[1px]">
                <Lottie
                  animationData={butterflyAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full"
                  style={{ width: '100%' }}
                />
              </div>
            )}
            <div className="absolute md:relative left-1/2 md:left-[unset] md:top-[unset] -translate-x-1/2 top-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 w-full flex items-center justify-center text-white z-10">
              {title}
            </div>
          </div>
        )}
        <div className="marquee-section relative w-full">
          <Marqy
            speed={speed}
            direction={reverse ? 'right' : 'left'}
            pauseOnHover={false}
            className="marquee"
          >
            <div className="marquee--item">
              {items.map((item, key) => {
                const ItemType = link ? NextLink : 'div'
                return (
                  <ItemType key={key} href={link ? getPageUrl(link) : null} className="marquee--text">
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                    <div>{item.text}</div>
                  </ItemType>
                )
              })}
            </div>
          </Marqy>
        </div>
        {icon && (
          <div className="marquee-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[28rem] md:h-[35rem]">
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
