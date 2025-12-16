import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Media from '@components/media'
import { useWindowSize } from '@lib/helpers'

const MOBILE_BREAKPOINT = 950

const ProductContents = ({ data = {} }) => {
  const { title, contents } = data
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const showCarousel = isClient && isMobile
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    loop: true,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (showCarousel) {
      emblaApi?.reInit()
    }
  }, [emblaApi, showCarousel, contents?.length])

  return (
    <section className={`mx-auto mt-15 md:px-15`}>
      <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>

      <div className="w-full px-10 md:px-0">
        <div className="w-full">
          <div className="grid-standard border-b border-cement">
            <div className="col-span-12 md:col-span-8 bg-cement px-10 h-[3rem] text-center flex items-center justify-center">
              <h2 className="title-normal">{title}</h2>
            </div>
            <div className="col-span-4 hidden md:flex items-center justify-end">
              <div className="title-normal">{`${contents?.length} items`}</div>
            </div>
          </div>
        </div>
        {showCarousel ? (
          <div ref={emblaRef} className="mt-15 w-full">
            <div className="flex">
              {contents?.map((content, index) => (
                <div
                  key={index}
                  className="w-[83.333%] min-w-[83.333%] ml-10 first:ml-0"
                >
                  <div className="w-full pb-[100%] relative">
                    <Media
                      media={content?.media?.content}
                      width={1600}
                      srcSizes={[800, 1000, 1200, 1600]}
                      sizes="100%"
                      layout={'fill'}
                      className={
                        'absolute top-0 left-0 h-full w-full object-cover'
                      }
                    />
                  </div>
                  <div className="px-10 mt-10 flex gap-10 justify-start md:justify-between items-center">
                    <div className="text-slate">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    <div className="title-normal">{content?.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid-standard mt-15">
            {contents?.map((content, index) => (
              <div key={index} className="col-span-2">
                <div className="w-full pb-[100%] relative">
                  <Media
                    media={content?.media?.content}
                    width={1600}
                    srcSizes={[800, 1000, 1200, 1600]}
                    sizes="100%"
                    layout={'fill'}
                    className={
                      'absolute top-0 left-0 h-full w-full object-cover'
                    }
                  />
                </div>
                <div className="px-10 mt-10 flex justify-between items-center">
                  <div className="">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </div>
                  <div className="title-normal">{content?.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductContents
