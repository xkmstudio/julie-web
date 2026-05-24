import React, { useState, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useInView } from 'react-intersection-observer'
import ProductCard from '@components/product/product-card'
import ProductCardAlternate from '@components/product/product-card-alternate'
import Link from '@components/link'
const ProductFeature = ({ data, onFrameLinkClick }) => {
  const { products, title, cta } = data
  const [isClient, setIsClient] = useState(false)
  const productCount = products?.length || 0

  const [target, setTarget] = useState(undefined)
  const scrollRef = useRef(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      skipSnaps: false,
      loop: true,
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis: 'x',
        target,
      }),
    ]
  )
  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setTarget(scrollRef.current || undefined)
  }, [])

  useEffect(() => {
    if (triggerInView && emblaApi) {
      emblaApi.reInit()
    }
  }, [triggerInView, emblaApi])

  if (!products) return null

  const isAlternative = products[0]?.productType === 'alternate'
  const CardComponent = isAlternative ? ProductCardAlternate : ProductCard

  // Carousel when more than 2 products (3+); 2 or fewer use original flex layout
  const showCarousel = isClient && productCount > 2

  if (!showCarousel) {
    return (
      <section className="px-10 md:px-15 overflow-hidden section-padding">
        {title && (
          <div
            className={
              cta
                ? 'mb-30 flex justify-between items-end pr-15 md:pr-20'
                : 'mb-30 text-center'
            }
          >
            <h2 className="title-xl">{title}</h2>
            {cta && (
              <Link link={cta} className="btn" onFrameLinkClick={onFrameLinkClick} />
            )}
          </div>
        )}
        <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>
        <div className="w-full h-full flex gap-15 md:gap-25 relative z-2">
          {products?.map((product, key) => (
            <CardComponent
              key={key}
              index={key}
              className="flex-1"
              product={product}
              onFrameLinkClick={onFrameLinkClick}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      className="w-full pl-15 md:pl-25 py-20 relative z-[4] md:z-auto"
      ref={triggerRef}
    >
      {title && (
        <div className="w-full flex justify-between items-end mb-20 pr-15 md:pr-20">
          <h2 className="title-xl">{title}</h2>
          {cta && (
            <Link link={cta} className="btn" onFrameLinkClick={onFrameLinkClick} />
          )}
        </div>
      )}
      <div ref={scrollRef}>
        <div ref={emblaRef}>
          <div className="flex">
            {products.map((product, key) => (
              <div
                key={key}
                className="flex-[0_0_83.333%] md:flex-[0_0_40%] min-w-0 ml-15 md:ml-25"
              >
                <CardComponent
                  product={product}
                  index={key}
                  className="block w-full"
                  imageAspect="article"
                  onFrameLinkClick={onFrameLinkClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductFeature
