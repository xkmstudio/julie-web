import React from 'react'
import cx from 'classnames'
import NextLink from 'next/link'
import Media from '@components/media'
import ProductPrice from '@components/product/product-price'

const ProductCard = ({ product, index, className}) => {

  
  return (
    <NextLink
            href={`/products/${product.slug}`}
            className={className}
          >
            <div className="w-full h-full">
              <div className="w-full pb-[150%] relative">
                <Media
                  media={product.productThumbnail?.content}
                  width={1600}
                  srcSizes={[800, 1000, 1200, 1600]}
                  sizes="100%"
                  layout={'fill'}
                  className={'absolute top-0 left-0 h-full w-full object-cover'}
                />
                <img
                  className={cx(`pointer-events-none absolute -top-1`, {
                    '-left-1 w-[36%]': index == 0,
                    '-right-1 w-[33%]': index == 1,
                    '-left-1 w-[33%]': index == 2,
                    '-right-1': index == 3,
                  })}
                  src={`/icons/tear_${index + 1}.svg`}
                  alt={`Tear ${index + 1}`}
                />
                <div className="absolute z-2 bottom-0 left-0 w-full h-full flex items-end justify-between py-10 px-10 md:px-15 text-white mix-blend-difference">
                  <div>[</div>
                  <div>{product.subtitle}</div>
                  <div>]</div>
                </div>
              </div>

              <div className="mt-10 flex justify-between items-center px-10 md:px-15">
                <h3 className="title-normal">{product.title}</h3>
                <div>
                  <ProductPrice
                    price={product.price}
                    comparePrice={product.comparePrice}
                  />
                </div>
              </div>
            </div>
          </NextLink>
  )
}

export default ProductCard

