import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import useEmblaCarousel from 'embla-carousel-react'
import cx from 'classnames'

import Icon from '@components/icon'
import Photo from '@components/photo'

/**
 * REQUIREMENTS IN PARENT LAYOUT:
 * - The column that contains this component should have `h-full min-h-0`.
 * - Its parent row should also allow shrinking: e.g. `<div className="flex h-full min-h-0">`.
 */

const CarouselConstruction = ({
  id = 'construction',
  slides = [],
  hasArrows = true,
  hasDrag = true,
  className,
  title,
  activeSlide,
  setActiveSlide,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const imagesLoadedRef = useRef(0)

  // Embla: full-width "pages"
  const [sliderRef, slider] = useEmblaCarousel({
    loop: true,
    draggable: hasDrag,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  })

  const [scrollRef] = useInView({ threshold: 0.2, triggerOnce: true })

  const scrollPrev = useCallback(() => slider?.scrollPrev(), [slider])
  const scrollNext = useCallback(() => slider?.scrollNext(), [slider])
  const scrollTo = useCallback((i) => slider?.scrollTo(i), [slider])

  const onSelect = useCallback(() => {
    if (!slider) return
    const idx = slider.selectedScrollSnap()
    setCurrentSlide(idx)
    setActiveSlide?.(idx)
  }, [slider, setActiveSlide])

  useEffect(() => {
    if (!slider) return
    slider.on('select', onSelect)
    onSelect()
    return () => {
      try {
        slider.off('select', onSelect)
      } catch {}
    }
  }, [slider, onSelect])

  useEffect(() => {
    if (activeSlide !== undefined && activeSlide !== currentSlide) {
      scrollTo(activeSlide)
    }
  }, [activeSlide, currentSlide, scrollTo])

  // --- Relative sizing model ---
  // 1) Find tallest intrinsic pattern height across all slides
  const maxIntrinsicH = useMemo(() => {
    const hs = slides.map((s) => s?.pattern?.height || 0).filter(Boolean)
    return hs.length ? Math.max(...hs) : 1
  }, [slides])

  // 2) Compute a responsive box style for each pattern, *as a percentage of slide height*.
  //    No fixed pixels. Width derives from height using aspect-ratio.
  //    scale = overall padding inside each slide (0.9 = 90% of slide height)
  const SCALE = 0.9
  const getPercentBoxStyle = (pattern) => {
    const pw = pattern?.width || 800
    const ph = pattern?.height || 800
    const rel = Math.max(0.01, ph / maxIntrinsicH) // avoid 0
    return {
      height: `${Math.min(rel * 100 * SCALE, 100)}%`,
      aspectRatio: `${pw} / ${ph}`,
      maxWidth: '92%',
    }
  }

  // Re-init Embla after images load (helps if intrinsic sizes affect measurement)
  const handleImageLoad = useCallback(() => {
    imagesLoadedRef.current += 1
    if (imagesLoadedRef.current >= slides.length) {
      slider?.reInit()
    }
  }, [slider, slides.length])

  // Re-init on resize as a safety net
  useEffect(() => {
    const onResize = () => slider?.reInit()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [slider])

  const fmt = (n) => String(n + 1).padStart(2, '0')

  return (
    <div
      ref={scrollRef}
      className={cx(
        'relative w-full h-full min-h-0 flex flex-col border border-cement border-l-0 md:border-l',
        { 'has-drag': hasDrag },
        className
      )}
      id={id}
    >
      {/* Top Navigation Bar */}
      <div className="grid grid-cols-12 flex-shrink-0">
        <div className="bg-cement col-span-8 md:col-span-6 flex items-center justify-center">
          <button
            className="w-[3rem] h-[3rem] bg-black text-white flex items-center justify-center"
            aria-label="Help"
          >
            <span className="text-sm">?</span>
          </button>
          {title && (
            <div className="flex-1 text-center uppercase tracking-wide">
              {title}
            </div>
          )}
        </div>

        {hasArrows && (
          <div className="col-span-4 md:col-span-6 flex items-center justify-between gap-10">
            <button
              onClick={scrollPrev}
              className="h-[3rem] w-[3rem] flex items-center justify-center flex-shrink-0"
              aria-label="Previous slide"
            >
              {`<`}
            </button>
            <span className="text-sm text-center">
              {fmt(currentSlide)}/{fmt(slides.length)}
            </span>
            <button
              onClick={scrollNext}
              className="h-[3rem] w-[3rem] flex items-center justify-center flex-shrink-0"
              aria-label="Next slide"
            >
              {`>`}
            </button>
          </div>
        )}
      </div>

      {/* Carousel viewport (must be allowed to shrink; fill remaining height) */}
      <div className="w-full bg-[#F5F5F5] h-[30rem] md:flex-1 min-h-0 relative">
        <div className="w-full h-full absolute top-0 left-0 flex-1 min-h-0 bg-[length:10px_10px] bg-[linear-gradient(to_right,#E3E3E3_0.3px,transparent_0.3px),linear-gradient(to_bottom,#E3E3E3_0.3px,transparent_0.3px)] bg-[#f5f5f5]"></div>
        <div
          ref={sliderRef}
          className="w-full h-full min-h-0 overflow-hidden absolute top-0 left-0 z-2"
        >
          {/* Embla container */}
          <div className="flex h-full select-none">
            {slides.map((slide, i) => {
              const pattern = slide?.pattern || {}
              const isActive = slider
                ? slider.selectedScrollSnap() === i
                : i === 0

              return (
                <div
                  key={i}
                  className={cx(
                    // Full page slide
                    'basis-full shrink-0 grow-0',
                    // Fill height and center content
                    'grid place-items-center h-full py-6'
                  )}
                  data-active={isActive ? 'true' : 'false'}
                >
                  {/* Box sized relative to tallest pattern; width via aspect-ratio */}
                  <div
                    className="relative w-auto"
                    style={getPercentBoxStyle(pattern)}
                  >
                    <Photo
                      width={pattern.width || 800}
                      height={pattern.height || 800}
                      // Image fills the box while preserving ratio
                      className="block w-full h-full object-contain"
                      layout="intrinsic"
                      photo={pattern}
                      // sizes is generous; Embla slide is 100vw of its column
                      sizes="(min-width: 1280px) 50vw, 90vw"
                      srcSizes={[600, 800, 1200, 1600]}
                      onLoad={handleImageLoad}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarouselConstruction
