import React, { useState, useCallback, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import Media from '@components/media'
import { useInView } from 'react-intersection-observer'

const Carousel = ({ slides, size, title, hasNav }) => {
  const [triggerRef, triggerInView] = useInView({ threshold: 0, triggerOnce: false })

  const options = {
    loop: true,
    skipSnaps: true,
    axis: 'x',
    align: 'center',
    dragFree: false,
    containScroll: 'trimSnaps',
  }

  const [target, setTarget] = useState(undefined)
  const scrollRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const [emblaRef, embla] = useEmblaCarousel(options, [
    WheelGesturesPlugin({
      forceWheelAxis: 'x',
      target,
    }),
  ])

  // Set wheel target once after mount
  useEffect(() => {
    setTarget(scrollRef.current || undefined)
  }, [])

  // Keep Embla healthy when the carousel enters the viewport
  useEffect(() => {
    if (triggerInView) embla?.reInit()
  }, [triggerInView, embla])

  // Update caption when slide changes (and on init / reInit)
  const onSelect = useCallback(() => {
    if (!embla) return
    setCurrentSlide(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    onSelect() // set initial
    embla.on('select', onSelect)
    embla.on('reInit', onSelect)
    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', onSelect)
    }
  }, [embla, onSelect])

  return (
    <div className="w-full" ref={triggerRef}>
      <div ref={scrollRef} className="overflow-hidden">
        <div
          ref={emblaRef}
          className={`slideshow--container w-full relative cursor-[grab] pr-10 is-${size || 'large'}`}
        >
          <div className="slideshow-slides w-full relative flex items-center select-none">
            {slides?.map((slide, key) =>
              slide.media?.content?._type === 'asset' ? (
                <div
                  data-type={slide.media?._type}
                  className={`relative slideshow-slide ${embla?.selectedScrollSnap() === key ? ' is-active' : ''}`}
                  style={{ '--slideRatio': slide.media?.content?.aspectRatio || 1.6 }}
                  key={key}
                >
                  <Media className="" isSlide layout="fill" media={slide.media?.content} />
                </div>
              ) : (
                <React.Fragment key={key}>
                  <Media className="" isSlide layout="fill" media={slide.media?.content} />
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>

      {hasNav && (
        <div className="grid-standard absolute bottom-0 left-0 w-full">
          <div className="col-span-6 bg-cement px-10 md:px-15 h-[3rem] text-center flex items-center justify-center">
            <h2 className="title-normal">{title}</h2>
          </div>
          <div className="col-span-6 text-white pr-5">
            <div className="flex items-center justify-between w-full">
              <button
                className="w-[3rem] h-[3rem] flex items-center justify-center"
                onClick={() => embla?.scrollPrev()}
              >
                {`<`}
              </button>
              <div>{slides?.[currentSlide]?.caption}</div>
              <button
                className="w-[3rem] h-[3rem] flex items-center justify-center"
                onClick={() => embla?.scrollNext()}
              >
                {`>`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Carousel
