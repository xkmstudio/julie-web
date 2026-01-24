import React, { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useInView } from 'react-intersection-observer'
import Media from '@components/media'
import { useWindowSize, useIsInFrame } from '@lib/helpers'

const MOBILE_BREAKPOINT = 850

const Media3Up = ({ data = {} }) => {
  const { items, title, subtitle, background } = data
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isInFrame = useIsInFrame()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const showCarousel = isClient && (isMobile || isInFrame)
  const autoplayRef = React.useRef(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      containScroll: 'trimSnaps',
      dragFree: false,
      skipSnaps: false,
      loop: true,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true }, autoplayRef)]
  )

  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (showCarousel && triggerInView) {
      emblaApi?.reInit()
      autoplayRef.current?.play()
    }
  }, [emblaApi, showCarousel, triggerInView, items?.length])

  useEffect(() => {
    if (!showCarousel && autoplayRef.current) {
      autoplayRef.current?.stop()
    }
  }, [showCarousel])

  if (!items?.length) return null

  const renderCard = (item, index) => {
    return (
      <div
        key={index}
        className="relative w-full rounded-[1.5rem]"
        style={{ aspectRatio: '3/4' }}
      >
        <div className='relative w-full h-full px-30 pb-[9rem]'>
            <div className='relative w-full h-full rounded-[1.5rem] overflow-hidden'>
                {/* Media */}
                {item.media?.content && (
                  <Media
                    media={item.media.content}
                    width={1600}
                    srcSizes={[800, 1000, 1200, 1600]}
                    sizes="100%"
                    layout="fill"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                )}
            </div>
        </div>

        <div className="absolute z-2 bottom-0 left-0 right-0 w-full text-white">
          <div className="absolute flex flex-col items-center z-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {item.title && (
              <div className="text-40 md:text-48 font-lxb">
                {item.title}
              </div>
            )}
            {item.subtitle && (
              <div className="text-14 md:text-16 font-plaid uppercase">
                {item.subtitle}
              </div>
            )}
          </div>
          <div className="w-full h-[18rem] rounded-[100%] julie-gradient blur-[20px]"></div>
        </div>
      </div>
    )
  }

  // Background gradient style
  const backgroundStyle = background
    ? {
        background:
          'linear-gradient(to bottom, #4A9EFF 0%, #87CEEB 25%, #FFD89B 60%, #FFB3D9 100%)',
      }
    : {}

  return (
    <section ref={triggerRef} className="relative w-full section-padding">
      <div className="w-full rounded-[1.2rem] sky-gradient md:px-30 pt-60">
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-30 md:px-15 mb-30 md:mb-40 text-center text-white">
            {subtitle && (
              <div className="text-20 font-lb mb-5">{subtitle}</div>
            )}
            {title && (
              <div className="text-32 md:text-48 font-lxb leading-110">
                {title}
              </div>
            )}
          </div>
        )}

        {/* Carousel on mobile, grid on desktop */}
        {showCarousel ? (
          <div className="w-full">
            <div ref={emblaRef} className="">
              <div className="flex">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="w-full md:w-[83.333%] min-w-full md:min-w-[83.333%] ml-10 first:ml-0"
                  >
                    {renderCard(item, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full px-10 md:px-15">
            <div className="w-full flex gap-15 md:gap-30">
              {items.map((item, index) => (
                <div key={index} className="flex-1">
                  {renderCard(item, index)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Media3Up
