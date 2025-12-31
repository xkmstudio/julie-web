import React, { useState, useEffect } from 'react'

import ProductCard from '@components/product/product-card'
import ProductCarousel from '@components/product-carousel'
import { useWindowSize, useIsInFrame } from '@lib/helpers'

const MOBILE_BREAKPOINT = 950
const DESKTOP_CAROUSEL_THRESHOLD = 3

const ProductFeature = ({ data, onFrameLinkClick }) => {
  const { products } = data
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isInFrame = useIsInFrame()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const isDesktop = width >= MOBILE_BREAKPOINT
  const productCount = products?.length || 0

  // Show carousel on mobile, always in frame, or on desktop if more than 3 products
  const showCarousel = isClient && (isMobile || isInFrame || (isDesktop && productCount > DESKTOP_CAROUSEL_THRESHOLD))

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Desktop: use carousel if more than 3 products, otherwise use flex
  // Mobile: always use carousel
  // In frame: always use carousel
  if (showCarousel) {
    // Use mobile slide size when in frame or on mobile
    const slideClassName = (isMobile || isInFrame)
      ? 'w-[83.333%] min-w-[83.333%] ml-10'
      : 'min-w-[30%] ml-10'

    return (
      <section className="px-10 md:px-15 overflow-hidden section-padding">
        <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>
        <ProductCarousel
          items={products}
          renderSlide={(product, index) => (
            <ProductCard
              product={product}
              index={index}
              className="block w-full"
              onFrameLinkClick={onFrameLinkClick}
            />
          )}
          slideClassName={slideClassName}
          enabled={showCarousel}
        />
      </section>
    )
  }

  // Desktop with 3 or fewer products: use flex layout
  return (
    <section className="px-10 md:px-15 overflow-hidden section-padding">
      <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>
      <div className="w-full h-full flex gap-15 md:gap-25 relative z-2">
        {products?.map((product, key) => (
          <ProductCard
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

export default ProductFeature
