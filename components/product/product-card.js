import React, { useMemo, useState } from 'react'
import cx from 'classnames'
import NextLink from 'next/link'
import Media from '@components/media'
import { ProductActions } from '@components/product'
import { useAddItem } from '@lib/context'

const ProductCard = ({ product, index, className, type = 'feature' }) => {
  const addItem = useAddItem()

  console.log('product',product);
  

  if(!product) return null

  // Determine activeVariant - use first variant if available, otherwise create fallback from product data
  const activeVariant = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0]
    }
    // Fallback: create a minimal variant object from product data if variants aren't loaded
    // Default to inStock: true if not explicitly set, to allow "Add to Cart" to show
    // Note: Without a variant id, add to cart may not work, but UI will display correctly
    return {
      id: product.id || null,
      price: product.price,
      comparePrice: product.comparePrice,
      inStock: product.inStock !== undefined ? product.inStock : true, // Default to true if not specified
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

  const handleAddToCart = async () => {
    if (!activeVariant?.id) return

    try {
      // Add main product first
      await addItem(activeVariant.id, 1)
    } catch (error) {
      console.error('Error adding product to cart:', error)
    }
  }

  return type == 'feature' ? (
    <div
      className={cx(
        'flex flex-col bg-cement p-25 rounded-[1.5rem] overflow-hidden',
        className
      )}
    >
      <NextLink href={`/products/${product.slug}`} className="w-full">
        <div className="w-full h-[50vw] md:max-h-[75rem] relative flex flex-col items-center justify-between">
          {product?.title && (
            <div className="w-full text-center title-2xl max-w-[50rem]">
              {product?.title}
            </div>
          )}
          <div className="flex-1 w-full min-h-0 relative py-40">
            <div className="w-full h-full relative">
              <Media
                media={product.productThumbnail?.content}
                width={1600}
                srcSizes={[800, 1000, 1200, 1600]}
                sizes="100%"
                layout={'contain'}
                className={'h-full w-full object-contain'}
              />
            </div>
          </div>
        </div>
      </NextLink>

      <div className="flex gap-10" onClick={(e) => e.stopPropagation()}>
        <NextLink
          className="btn is-outline is-large flex-1"
          href={`/products/${product.slug}`}
        >
          Learn More
        </NextLink>
        <ProductActions
          product={product}
          type={'feature'}
          activeVariant={activeVariant}
          klaviyoAccountID={product.klaviyoAccountID}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  ) : (
    <div
      className={cx(
        'flex flex-col bg-cement p-25 rounded-[1.5rem] overflow-hidden',
        className
      )}
    >
      <NextLink href={`/products/${product.slug}`} className="w-full">
        <div className="w-full h-[50vw] md:max-h-[75rem] relative flex flex-col items-center justify-between">
          {product?.title && (
            <div className="w-full text-center title-2xl max-w-[50rem]">
              {product?.title}
            </div>
          )}
          <div className="flex-1 w-full min-h-0 relative py-40">
            <div className="w-full h-full relative">
              <Media
                media={product.productThumbnail?.content}
                width={1600}
                srcSizes={[800, 1000, 1200, 1600]}
                sizes="100%"
                layout={'contain'}
                className={'h-full w-full object-contain'}
              />
            </div>
          </div>
        </div>
      </NextLink>

      <div className="flex gap-10" onClick={(e) => e.stopPropagation()}>
        <NextLink
          className="btn is-outline is-large flex-1"
          href={`/products/${product.slug}`}
        >
          Learn More
        </NextLink>
        <ProductActions
          product={product}
          type={'feature'}
          activeVariant={activeVariant}
          klaviyoAccountID={product.klaviyoAccountID}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}

export default ProductCard
