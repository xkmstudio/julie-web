import React, { useMemo } from 'react'
import cx from 'classnames'
import NextLink from 'next/link'
import Media from '@components/media'
import { ProductActions } from '@components/product'
import { useAddItem } from '@lib/context'

const ProductCardAlternate = ({ product, index, className }) => {
  const addItem = useAddItem()

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

  const handleAddToCart = async () => {
    if (!activeVariant?.id) return

    try {
      await addItem(activeVariant.id, 1)
    } catch (error) {
      console.error('Error adding product to cart:', error)
    }
  }

  return (
    <div
      className={cx(
        'flex flex-col rounded-[1.5rem] overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <NextLink href={`/products/${product.slug}`} className="w-full">
        <div className="w-full h-[80vw] md:max-h-[50rem] relative">
          <div className="w-full h-full relative bg-cement rounded-[1.5rem] overflow-hidden">
            <Media
              media={product.productThumbnail?.content}
              width={1600}
              srcSizes={[800, 1000, 1200, 1600]}
              sizes="100%"
              layout={'fill'}
              className={'h-full w-full object-cover'}
            />
          </div>
        </div>
      </NextLink>

      {/* Title */}
      {product?.title && (
        <NextLink href={`/products/${product.slug}`} className="w-full mt-20">
          <div className="w-full text-center title-md">
            {product?.title}
          </div>
        </NextLink>
      )}

      {/* Product Actions */}
      <div className="mt-20" onClick={(e) => e.stopPropagation()}>
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

export default ProductCardAlternate

