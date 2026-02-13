import React, { useMemo, useState } from 'react'
import cx from 'classnames'
import NextLink from 'next/link'
import Media from '@components/media'
import { ProductActions } from '@components/product'
import { useAddItem } from '@lib/context'
import { useIsInFrame } from '@lib/helpers'
import Link from '@components/link'

const ProductCard = ({
  product,
  index,
  className,
  type = 'feature',
  onFrameLinkClick,
}) => {
  const isInFrame = useIsInFrame()
  const shouldHandleInFrame = isInFrame && onFrameLinkClick
  const productHref = `/products/${product.slug}`
  const addItem = useAddItem()

  if (!product) return null

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

  // Hide ProductActions if product has more than 1 variant
  const hasMultipleVariants = product.variants && product.variants.length > 1

  return type == 'feature' ? (
    <div
      className={cx(
        'flex flex-col bg-cement rounded-[1.5rem] overflow-hidden relative',
        product.productType == 'alternate' ? 'text-white' : '',
        product.productType == 'alternate' ? '' : '',
        className
      )}
    >
      {shouldHandleInFrame ? (
        <a
          href={productHref}
          onClick={(e) => {
            e.preventDefault()
            onFrameLinkClick(productHref)
          }}
          className="w-full"
        >
          <div className="w-full h-[100vw] md:h-[50vw] md:max-h-[75rem] relative flex flex-col items-center justify-between">
            {product?.title && (
              <div className="w-full text-center title-2xl max-w-[50rem] relative z-2 p-15 md:p-25 pb-0">
                {product?.title}
              </div>
            )}
            <div className={cx(`flex-1 w-full min-h-0 relative py-20 md:py-40`, {
              'absolute top-0 left-0': product.productType == 'alternate',
            })}>
              <div className="w-full h-full relative">
                <Media
                  media={product.productThumbnail?.content}
                  width={1600}
                  srcSizes={[800, 1000, 1200, 1600]}
                  sizes="100%"
                  layout={
                    product.productType == 'alternate' ? 'fill' : 'contain'
                  }
                  className={cx('h-full w-full', {
                    ' object-cover': product.productType == 'alternate',
                    ' object-contain': product.productType == 'primary',
                  })}
                />
              </div>
            </div>
          </div>
        </a>
      ) : (
        <NextLink href={productHref} className="w-full">
          <div className="w-full h-[100vw] md:h-[50vw] md:max-h-[75rem] relative flex flex-col items-center justify-between">
            {product?.title && (
              <div className="relative z-2 w-full text-center title-2xl max-w-[50rem] p-15 md:p-25 pb-0">
                {product?.title}
              </div>
            )}
            <div className={cx(`flex-1 w-full min-h-0`, {
              'absolute top-0 left-0 w-full h-full': product.productType == 'alternate',
              'relative py-20 md:py-40': product.productType == 'primary',
            })}>
              <div className="w-full h-full relative">
                <Media
                  media={product.productThumbnail?.content}
                  width={1600}
                  srcSizes={[800, 1000, 1200, 1600]}
                  sizes="100%"
                  layout={product.productType == 'alternate' ? 'fill' : 'contain'}
                  className={cx('h-full w-full', {
                    ' object-cover': product.productType == 'alternate',
                    ' object-contain': product.productType == 'primary',
                  })}
                />
              </div>
            </div>
          </div>
        </NextLink>
      )}

      <div
        className={cx(`flex flex-col md:flex-row gap-10 p-15 md:p-25`, {
          'absolute bottom-0 left-0 w-full': product.productType == 'alternate',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        {shouldHandleInFrame ? (
          <a
            className={cx("btn is-outline is-large flex-[1_1_0%] min-w-0", {
              'is-white': product.productType == 'alternate',
            })}
            href={productHref}
            onClick={(e) => {
              e.preventDefault()
              onFrameLinkClick(productHref)
            }}
          >
            learn more
          </a>
        ) : (
          <NextLink
            className={cx("btn is-outline is-large flex-[1_1_0%] min-w-0", {
              'is-white': product.productType == 'alternate',
            })}
            href={productHref}
          >
            learn more
          </NextLink>
        )}
        {!hasMultipleVariants && (
          product.disableAddToCart && product.additionalLinks && product.additionalLinks.length > 0 ? (
            <Link
              link={product.additionalLinks[0]}
              className="btn is-add is-large flex items-center justify-center gap-5 flex-[1_1_0%] min-w-0"
            />
          ) : !product.disableAddToCart ? (
            <ProductActions
              product={product}
              type={'feature'}
              activeVariant={activeVariant}
              klaviyoAccountID={product.klaviyoAccountID}
              onAddToCart={handleAddToCart}
            />
          ) : null
        )}
      </div>
    </div>
  ) : (
    <div
      className={cx(
        'flex flex-col bg-cement p-25 rounded-[1.5rem] overflow-hidden',
        className
      )}
    >
      {shouldHandleInFrame ? (
        <a
          href={productHref}
          onClick={(e) => {
            e.preventDefault()
            onFrameLinkClick(productHref)
          }}
          className="w-full"
        >
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
        </a>
      ) : (
        <NextLink href={productHref} className="w-full">
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
      )}

      <div className="flex gap-10" onClick={(e) => e.stopPropagation()}>
        {shouldHandleInFrame ? (
          <a
            className="btn is-outline is-large flex-[1_1_0%] min-w-0"
            href={productHref}
            onClick={(e) => {
              e.preventDefault()
              onFrameLinkClick(productHref)
            }}
          >
            learn more
          </a>
        ) : (
          <NextLink
            className="btn is-outline is-large flex-[1_1_0%] min-w-0"
            href={productHref}
          >
            learn more
          </NextLink>
        )}
        {!hasMultipleVariants && (
          product.disableAddToCart && product.additionalLinks && product.additionalLinks.length > 0 ? (
            <Link
              link={product.additionalLinks[0]}
              className="btn is-add is-large flex items-center justify-center gap-5 flex-[1_1_0%] min-w-0"
            />
          ) : !product.disableAddToCart ? (
            <ProductActions
              product={product}
              type={'feature'}
              activeVariant={activeVariant}
              klaviyoAccountID={product.klaviyoAccountID}
              onAddToCart={handleAddToCart}
            />
          ) : null
        )}
      </div>
    </div>
  )
}

export default ProductCard
