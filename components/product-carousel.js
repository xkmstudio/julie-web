import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

/**
 * Reusable Product Carousel Component
 * 
 * @param {Array} items - Array of items to render as slides
 * @param {Function} renderSlide - Function to render each slide: (item, index) => ReactNode
 * @param {string} slideClassName - Class names for each slide container (e.g., "min-w-[30%] ml-10")
 * @param {string} containerClassName - Class names for the carousel container
 * @param {Object} emblaOptions - Custom Embla carousel options
 * @param {boolean} enabled - Whether the carousel should be enabled
 */
const ProductCarousel = ({
  items = [],
  renderSlide,
  slideClassName = 'w-[83.333%] min-w-[83.333%] ml-10',
  containerClassName = 'w-full relative',
  emblaOptions = {
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    loop: true,
  },
  enabled = true,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)

  useEffect(() => {
    if (enabled && emblaApi) {
      emblaApi.reInit()
    }
  }, [emblaApi, enabled, items?.length])

  if (!enabled || !items?.length) {
    return null
  }

  return (
    <div ref={emblaRef} className={containerClassName}>
      <div className="flex">
        {items.map((item, key) => (
          <div key={key} className={slideClassName}>
            {renderSlide(item, key)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel
