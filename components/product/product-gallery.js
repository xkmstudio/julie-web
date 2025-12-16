import React, { useState, useEffect, useCallback } from 'react'

import useEmblaCarousel from 'embla-carousel-react'
import cx from 'classnames'

import Photo from '@components/photo'

const ProductGallery = ({ slides, activeVariant, hasDrag, id }) => {
  if (!slides || !activeVariant) return null

  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const [sliderRef, slider] = useEmblaCarousel({
    loop: true,
    draggable: slides.length > 1,
    align: 'start',
  })

  const scrollTo = useCallback((index) => slider?.scrollTo(index), [slider])

  const onSelect = useCallback(() => {
    setCurrentSlide(slider.selectedScrollSnap())
  }, [slider])

  useEffect(() => {
    if (slider) {
      setScrollSnaps(slider.scrollSnapList())
      slider.on('select', onSelect)
      onSelect()
    }
  }, [slider])

  return (
    <>
      <div
        key={id}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        className={cx(
          `carousel relative w-full is-product${
            slides.length < 2
              ? ' cursor-default'
              : isDragging
              ? ' cursor-[grabbing]'
              : ' cursor-[grab]'
          }`,
          { 'has-drag': hasDrag },
          { 'has-title': slides[0]?.title }
        )}
      >
        <div
          ref={sliderRef}
          className="carousel--container w-full relative overflow-hidden rounded-[2rem]"
        >
          <div className="carousel--slides w-full relative flex items-center select-none">
            {slides.map((slide, key) => (
              <div
                className={`relative carousel-slide${
                  slider?.selectedScrollSnap() == key ? ' is-active' : ''
                }`}
                key={key}
              >
                <div className="w-full relative carousel-slide--inner">
                  <div className="w-full pb-[100%] relative carousel-image overflow-hidden">
                    <Photo
                      key={key}
                      width={1600}
                      srcSizes={[600, 800, 1200, 1600]}
                      sizes="100%"
                      layout={'fill'}
                      photo={slide}
                      className="w-full h-full object-cover top-0 left-0 absolute"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="grid grid-cols-6 gap-10 z-3 mt-20">
          {slides.map((slide, key) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className={`col-span-1 flex items-center justify-center group`}
            >
              <div className='w-full pb-[100%] relative rounded-[1rem] overflow-hidden'>
                <Photo
                  key={key}
                  width={1600}
                  srcSizes={[600, 800, 1200, 1600]}
                  sizes="100%"
                  layout={'fill'}
                  photo={slide}
                  className="w-full h-full object-cover top-0 left-0 absolute"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default ProductGallery
