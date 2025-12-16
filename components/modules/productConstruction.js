import React, { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'
import Media from '@components/media'
import CarouselConstruction from '@components/carouselConstruction'

const ProductConstruction = ({ data = {} }) => {
  const { title, contents } = data

  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <section className={`mx-auto px-10 md:px-15`}>
      <div className="w-full grid-standard">
        <div className="col-span-12 md:col-span-4">
            <div className='w-full pb-[100%] relative bg-cement'>
                <div className='w-full h-full p-[4rem] absolute left-0 top-0'>
                    <Media
                        media={contents[activeSlide]?.media?.content}
                        width={1600}
                        srcSizes={[800, 1000, 1200, 1600]}
                        sizes="100%"
                        layout={'contain'}
                        className={
                          'h-full w-full object-contain'
                        }
                      />
                </div>
            </div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <CarouselConstruction setActiveSlide={setActiveSlide} activeSlide={activeSlide} slides={contents} title={title} />
        </div>
      </div>
    </section>
  )
}

export default ProductConstruction
