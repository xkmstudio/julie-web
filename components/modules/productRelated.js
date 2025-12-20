import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import ProductCard from '@components/product/product-card'
import { useWindowSize } from '@lib/helpers'
import Media from '@components/media'

const ProductRelated = ({ data = {} }) => {
  const { product, media, title } = data

  return (
    <section className="px-10 md:px-15 overflow-hidden">
      <div className="absolute left-0 top-0 w-10 h-full bg-white z-1"></div>

      <div className="w-full border-l border-cement">
        <div className="w-full h-full flex gap-25">
          <div className="w-1/2 relative rounded-[1.5rem] overflow-hidden">
            <Media
              className="w-full h-full object-cover"
              layout="fill"
              media={media?.content}
            />
          </div>
          <ProductCard className="w-1/2" product={product} />
        </div>
      </div>
    </section>
  )
}

export default ProductRelated
