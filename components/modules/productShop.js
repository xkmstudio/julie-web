import React, { useState, useMemo } from 'react'
import NextLink from 'next/link'

import Media from '@components/media'
import Icon from '@components/icon'
import Photo from '@components/photo'
import { ProductActions } from '@components/product'

import { useAddItem } from '@lib/context'

const ProductShop = ({
  data = {},
  product: pageProduct,
  activeVariant: pageActiveVariant,
  onVariantChange,
}) => {
  const {
    product: dataProduct,
    title,
    description,
    values,
    logos,
    mobileTag,
  } = data
  const addItem = useAddItem()

  // Use page-level product if it matches data.product (has inventory data), otherwise use data.product
  const product = useMemo(() => {
    if (pageProduct && dataProduct && pageProduct.id === dataProduct.id) {
      return pageProduct
    }
    return dataProduct
  }, [pageProduct, dataProduct])

  if (!product) return null

  // Determine activeVariant for this product
  // If pageActiveVariant belongs to this product, use it; otherwise use default variant
  const activeVariant = useMemo(() => {
    if (pageActiveVariant && product.variants) {
      const matchingVariant = product.variants.find(
        (v) => v.id === pageActiveVariant.id
      )
      if (matchingVariant) {
        return matchingVariant
      }
    }
    // Fall back to first variant if no match
    return product.variants?.[0] || null
  }, [pageActiveVariant, product])

  // Toolkit state - default to included (true)
  const [toolkitIncluded, setToolkitIncluded] = useState(true)

  // Get toolkit product ID from product settings
  const toolkitProductID = product?.toolkitProductID

  // Handle adding product with toolkit if included
  const handleAddToCart = async () => {
    if (!activeVariant?.id) return

    try {
      // Add main product first
      await addItem(activeVariant.id, 1)

      // If toolkit is included, add it silently after main product succeeds
      if (toolkitIncluded && toolkitProductID) {
        // Small delay to ensure main product is fully processed
        setTimeout(() => {
          addItem(String(toolkitProductID), 1, { silent: true })
        }, 200)
      }
    } catch (error) {
      console.error('Error adding product to cart:', error)
      // Don't add toolkit if main product fails
    }
  }

  // Get product image - prefer backgroundMedia, then previewImage, then heroImage
  const productImage =
    product.productThumbnail?.content ||
    product.backgroundMedia?.content ||
    product.previewImage ||
    product.heroImage

  return (
    <section className="px-10 md:px-15 shop-feature">
      <div className="grid-standard">
        {mobileTag && (
          <div className="text-pink items-center justify-center md:hidden col-span-12 flex mb-15">
            <div className="tag-glass">
              <div className="w-[1.5rem] flex items-center justify-center flex-shrink-0 rotate-180">
                <Icon name="Arrow Curve" viewBox="0 0 19 14" />
              </div>
              <div className="text-14 text-center flex-shrink-0">
                {mobileTag}
              </div>
            </div>
          </div>
        )}
        <div className="col-span-12 md:col-span-3 pr-20">
          {productImage && (
            <div className="relative w-full pb-[100%]">
              <Media
                media={productImage}
                width={1600}
                srcSizes={[800, 1000, 1200, 1600]}
                sizes="(max-width: 768px) 100vw, 50vw"
                layout="contain"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
              {product.productBadge && (
                <div className="absolute top-0 right-0 z-2">
                  <div className="w-[10rem]">
                    <Photo
                      width={1000}
                      srcSizes={[800, 1000, 1200, 1600]}
                      sizes="100%"
                      layout="intrinsic"
                      photo={product.productBadge}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-9 flex flex-col items-center md:items-start justify-center gap-20 md:gap-30 mt-20 md:mt-0">
          <div>
            {title && (
              <h2 className="hidden md:block subtitle text-pink mb-20">
                {title}
              </h2>
            )}
            {description && (
              <div className="text-24 md:text-36 text-center md:text-left font-lxb leading-[1.05] tracking-[-.02rem]">
                {description}
              </div>
            )}
          </div>

          {values && values.length > 0 && (
            <ul className="flex flex-col md:flex-row flex-wrap gap-10 md:gap-20">
              {values.map((value, index) => (
                <li className="flex items-center gap-5" key={index}>
                  <span className="flex items-center justify-center w-[1.5rem]">
                    <Icon name="Checkmark" viewBox="0 0 16 12" />
                  </span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-30 items-center">
            <div className="flex flex-col md:flex-row gap-10">
              <NextLink
                className="btn is-outline is-large"
                href={`/products/${product.slug}`}
              >
                Learn More
              </NextLink>
              {activeVariant && (
                <ProductActions
                  product={product}
                  type={'feature'}
                  activeVariant={activeVariant}
                  klaviyoAccountID={product.klaviyoAccountID}
                  onAddToCart={handleAddToCart}
                  toolkitIncluded={toolkitIncluded}
                  toolkitProductID={toolkitProductID}
                />
              )}
            </div>
            {logos && logos.length > 0 && (
              <div className="hidden md:flex gap-35">
                {logos.map((logo, index) =>
                  logo?.asset ? (
                    <div className="h-[2.5rem] md:h-[3rem]">
                      <Photo
                        width={500}
                        srcSizes={[800, 1000, 1200, 1600]}
                        sizes="100%"
                        layout={'intrinsic'}
                        className={'h-full'}
                        photo={logo}
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductShop
