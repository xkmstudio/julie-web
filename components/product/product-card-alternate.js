import React, { useMemo } from 'react'
import cx from 'classnames'
import NextLink from 'next/link'
import Media from '@components/media'
import { ProductPrice } from '@components/product'

const ProductCardAlternate = ({ product, index, className, imageAspect = 'default' }) => {
  if(!product) return null

  // Determine activeVariant - use first variant if available, otherwise create fallback from product data
  const activeVariant = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0]
    }
    // Fallback: create a minimal variant object from product data if variants aren't loaded
    return {
      id: product.id || null,
      price: product.price,
      comparePrice: product.comparePrice,
      inStock: product.inStock !== undefined ? product.inStock : true,
      forceOutOfStock: product.forceOutOfStock || false,
    }
  }, [
    product.variants,
    product.id,
    product.price,
    product.comparePrice,
    product.inStock,
    product.forceOutOfStock,
  ])

  const isSoldOut = product.variants && product.variants.length > 0
    ? product.variants.every((v) => !v?.inStock || v?.forceOutOfStock)
    : !(activeVariant?.inStock && !activeVariant?.forceOutOfStock)

  return (
    <div
      className={cx(
        'flex flex-col rounded-[1.5rem] overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <NextLink href={`/products/${product.slug}`} className="w-full">
        <div
          className={
            imageAspect === 'article'
              ? 'w-full pb-[100%] md:pb-[66.6667%] relative rounded-[1rem] overflow-hidden bg-cement'
              : 'w-full h-[80vw] md:max-h-[50rem] relative'
          }
        >
          <div
            className={
              imageAspect === 'article'
                ? 'w-full h-full absolute top-0 left-0'
                : 'w-full h-full relative bg-cement rounded-[1.5rem] overflow-hidden'
            }
          >
            <Media
              media={product.productThumbnail?.content}
              width={1600}
              srcSizes={[800, 1000, 1200, 1600]}
              sizes={
                imageAspect === 'article'
                  ? '(max-width: 768px) 83.333vw, 40vw'
                  : '100%'
              }
              layout={'fill'}
              className={cx('h-full w-full object-cover', {
                'absolute top-0 left-0': imageAspect === 'article',
              })}
            />
          </div>
        </div>
      </NextLink>

      <div className="flex-1 flex flex-col justify-between">
        {/* Title */}
        {product?.title && (
          <NextLink href={`/products/${product.slug}`} className="w-full mt-20">
            <div className="w-full text-center title-md flex-1">
              {product?.title}
            </div>
          </NextLink>
        )}
  
        {/* Shop Now / Sold Out Link */}
        <div className="mt-20">
          <NextLink 
            href={`/products/${product.slug}`}
            className="btn is-add is-block flex items-center gap-5 w-full justify-center"
          >
            <div className="flex items-center gap-5">
              <span>{isSoldOut ? 'sold out' : 'shop now'}</span>
              {!isSoldOut && (
                <>
                  &mdash;
                  <ProductPrice
                    price={activeVariant?.price || product.price}
                    comparePrice={
                      activeVariant?.comparePrice || product.comparePrice
                    }
                  />
                </>
              )}
            </div>
          </NextLink>
        </div>
      </div>
    </div>
  )
}

export default ProductCardAlternate

