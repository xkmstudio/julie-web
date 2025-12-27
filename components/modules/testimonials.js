import React, { useState, useCallback, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

import { AnimatePresence, m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Media from '@components/media'
import Icon from '@components/icon'

const Testimonials = ({ data = {} }) => {
  const { testimonials, mediaLeft, mediaRight } = data

  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  const [scrollRef, inView] = useInView({ threshold: 0, triggerOnce: true })

  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const options = {
    loop: true,
    skipSnaps: true,
    axis: 'x',
    align: 'center',
    dragFree: false,
    containScroll: 'trimSnaps',
  }

  const autoplayOptions = {
    delay: 4500,
    stopOnInteraction: false, // Ensure autoplay doesn't stop automatically on interaction
  }

  const autoplay = useRef(Autoplay(autoplayOptions)) // Use useRef to store autoplay instance

  const [target, setTarget] = useState(undefined)
  const [emblaRef, embla] = useEmblaCarousel(options, [autoplay.current])

  useEffect(() => {
    setTarget(scrollRef.current)
  }, [scrollRef])

  useEffect(() => {
    if (triggerInView) {
      embla.reInit()
    }
  }, [triggerInView, embla])

  const scrollPrev = useCallback(() => {
    if (embla && autoplay.current) {
      autoplay.current.stop() // Stop autoplay when scrollPrev is clicked
      embla.scrollPrev()
    }
  }, [embla])

  const scrollNext = useCallback(() => {
    if (embla && autoplay.current) {
      autoplay.current.stop() // Stop autoplay when scrollNext is clicked
      embla.scrollNext()
    }
  }, [embla])

  const scrollTo = useCallback(
    (index) => {
      if (embla && autoplay.current) {
        autoplay.current.stop() // Stop autoplay when scrollTo is clicked
        embla.scrollTo(index)
      }
    },
    [embla]
  )

  const onSelect = useCallback(() => {
    setCurrentSlide(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (embla) {
      setScrollSnaps(embla.scrollSnapList())
      embla.on('select', onSelect)
      onSelect()
    }
  }, [embla, onSelect])

  return (
    <section ref={scrollRef} className="w-full overflow-hidden">
      <div className="w-full flex flex-col md:flex-row justify-between testimonials">
        <div
          className="flex-1 flex flex-col md:flex-row items-center overflow-hidden relative gap-20 md:gap-0"
          ref={triggerRef}
        >
          <div className="w-full">
            <div
              ref={emblaRef}
              className="w-full h-full flex items-center relative cursor-[grab]"
            >
              <div className="w-full relative flex items-center select-none">
                {testimonials?.map((testimonial, key) => {
                  return (
                    <div
                      className="relative w-[calc(100%+6rem)] md:w-[66.6667%] min-w-[calc(100%+6rem)] md:min-w-[66.6667%] flex flex-col items-center gap-15 px-15 md:px-30 py-40"
                      key={key}
                    >
                      <div className="relative w-full h-full py-60">
                        <div className="absolute left-0 top-0 w-full h-full rounded-[100%] bg-pink blur-[20px]"></div>
                        <div className="relative z-2 w-full flex flex-col items-center gap-15 md:gap-25 text-center text-white">
                          <div className="flex gap-5">
                            <div className='w-[2rem] h-[2rem]'><Icon name="Rating" viewBox="0 0 25 24" /></div>
                            <div className='w-[2rem] h-[2rem]'><Icon name="Rating" viewBox="0 0 25 24" /></div>
                            <div className='w-[2rem] h-[2rem]'><Icon name="Rating" viewBox="0 0 25 24" /></div>
                            <div className='w-[2rem] h-[2rem]'><Icon name="Rating" viewBox="0 0 25 24" /></div>
                            <div className='w-[2rem] h-[2rem]'><Icon name="Rating" viewBox="0 0 25 24" /></div>
                          </div>
                          <div className="w-full max-w-[60rem] mx-auto font-lxb text-18 md:text-24 px-30">
                            <BlockContent blocks={testimonial.content} />
                          </div>
                          <div className="text-18 font-plaid uppercase">
                            {testimonial.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
