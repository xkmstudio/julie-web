import React, { useRef } from 'react'
import { useIntersection } from 'use-intersection'
import { Marqy } from 'marqy'

import Photo from '@components/photo'

const Marquee = ({ data = {} }) => {
  const { items, speed, reverse, pausable } = data

  if (!items?.length) return null

  const marqueeRef = useRef()
  const isIntersecting = useIntersection(marqueeRef, {
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={marqueeRef} className="relative">
      <div className='marquee-section relative w-full'>
        <Marqy
          speed={speed}
          direction={reverse ? 'right' : 'left'}
          pauseOnHover={false}
          className="marquee"
        >
          <div className="marquee--item">
            {items.map((item, key) => {
              return (
                <span key={key} className="marquee--text">
                  {item.text}
                </span>
              )
            })}
          </div>
        </Marqy>
      </div>
    </section>
  )
}

export default Marquee
