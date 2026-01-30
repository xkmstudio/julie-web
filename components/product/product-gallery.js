import React, { useState, useEffect, useCallback, useRef } from 'react'

import useEmblaCarousel from 'embla-carousel-react'
import cx from 'classnames'

import Photo from '@components/photo'
import Icon from '@components/icon'

const ProductGallery = ({ 
  slides, 
  hasArrows = false, 
  hasCounter = false,
  hasDrag = true,
  className 
}) => {
  if (!slides || slides.length === 0) return null

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [emblaRef, embla] = useEmblaCarousel(
    {
      loop: true,
      draggable: hasDrag && slides.length > 1,
      align: 'start',
    },
    []
  )

  const scrollPrev = useCallback(() => {
    if (embla) embla.scrollPrev()
  }, [embla])

  const scrollNext = useCallback(() => {
    if (embla) embla.scrollNext()
  }, [embla])

  const scrollTo = useCallback(
    (index) => {
      if (embla) embla.scrollTo(index)
    },
    [embla]
  )

  const onSelect = useCallback(() => {
    if (!embla) return
    setCurrentSlide(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return

    onSelect()
    embla.on('select', onSelect)
    embla.on('reInit', onSelect)

    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', onSelect)
    }
  }, [embla, onSelect])

  const canScrollPrev = embla?.canScrollPrev() ?? false
  const canScrollNext = embla?.canScrollNext() ?? false

  return (
    <div className={cx('product-gallery w-full h-full', className)}>
      {/* Main Carousel */}
      <div
        className={cx(
          'relative w-full h-full overflow-hidden rounded-[2rem]',
          {
            'cursor-[grab]': hasDrag && slides.length > 1 && !isDragging,
            'cursor-[grabbing]': hasDrag && slides.length > 1 && isDragging,
            'cursor-default': !hasDrag || slides.length <= 1,
          }
        )}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div ref={emblaRef} className="w-full h-full overflow-hidden">
          <div className="flex w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cx(
                  'w-full min-w-[100%] h-full',
                  slide.forceContain && 'p-[1.5rem] md:p-[3rem]'
                )}
              >
                <div className="w-full h-full relative">
                  <Photo
                    photo={slide}
                    width={1600}
                    srcSizes={[600, 800, 1200, 1600]}
                    sizes="100vw"
                    layout="fill"
                    className={cx(
                      'absolute inset-0 w-full h-full',
                      slide.forceContain ? '!object-contain' : '!object-cover'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {slides.length > 1 && (
        <div className="absolute z-2 bottom-0 pb-20 left-1/2 -translate-x-1/2 flex gap-10">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Go to image ${index + 1}`}
              className={cx(
                'w-[1.5rem] h-[1.5rem] relative overflow-hidden rounded-[1rem]',
                'transition-colors duration-300',
                'hover:bg-pink',
                {
                  'bg-pink': currentSlide === index,
                  'bg-[#EDD4E4]': currentSlide != index,
                }
              )}
            >
              
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
