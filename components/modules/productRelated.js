import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import ProductCard from '@components/product/product-card'
import { useWindowSize } from '@lib/helpers'

const MOBILE_BREAKPOINT = 950

const ProductRelated = ({ data = {} }) => {
  const { products, title } = data
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
  }, [emblaApi, showCarousel, products?.length])

  return (
    <section className="px-10 md:px-15 overflow-hidden">
      <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>

      <div className="w-full border-l border-cement">
        {showCarousel ? (
          <div ref={emblaRef} className="w-full relative mt-10">
            <div className="flex">
              {products?.map((product, key) => (
                <div key={key} className="w-[83.333%] min-w-[83.333%] ml-10">
                  <ProductCard
                    product={product}
                    index={key}
                    className="block w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full grid-standard">
            <div className="title-large flex items-center justify-center col-span-3 bg-cement title-normal">
              {title}
            </div>
            {products?.map((product, key) => (
              <ProductCard
                key={key}
                className="col-span-3"
                product={product}
                index={key}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductRelated
