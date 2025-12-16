import React, { useRef, useState, useEffect } from 'react'

import { Marqy } from 'marqy'

import Media from '@components/media'

import { useWindowSize } from '@lib/helpers'

const MarqueeIndex = ({ items, className, index }) => {
  if (!items) return null

  const { width } = useWindowSize()
  const [mediaSize, setMediaSize] = useState(7)

  useEffect(() => {
    if (width < 950){
      setMediaSize(10)
    } else{
      setMediaSize(7)
    }
  }, [width])

  return (
    <div className={className}>
      <div className="marquee-section relative w-full">
        <Marqy
          speed={0.1}
          direction={index % 2 === 0 ? 'left' : 'right'}
          pauseOnHover={false}
          className="marquee"
        >
          <div className="marquee--item">
            {items?.map((item, key) => {
              const aspectRatio = item.content.aspectRatio || 1 // Default to 1 if aspectRatio is missing
              const itemWidth = `${aspectRatio * mediaSize}rem`

              return (
                <div
                  className="w-auto relative ml-5"
                  key={key}
                  style={{
                    height: `${mediaSize}rem`,
                    width: itemWidth,
                  }}
                >
                  <Media
                    className="w-full h-full object-cover overflow-hidden"
                    width={300}
                    srcSizes={[100, 200, 300, 400]}
                    layout="fill"
                    media={item?.content}
                  />
                </div>
              )
            })}
          </div>
        </Marqy>
      </div>
    </div>
  )
}

export default MarqueeIndex
