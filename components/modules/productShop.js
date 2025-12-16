import React, { useState, useEffect, useCallback } from 'react'

import ProductHero from '@components/modules/productHero'

import { hasObject } from '@lib/helpers'

const FeaturedProducts = ({ data = {} }) => {
  const { productHero } = data
  const product = productHero?.product
  if (!product) return null

  // Find the default variant
  const defaultVariant = product.variants?.find((v) => {
    const option = {
      name: product.options?.[0]?.name,
      value: product.options?.[0]?.values[0],
      position: product.options?.[0]?.position,
    }
    return hasObject(v.options, option)
  })
  const defaultVariantID = defaultVariant?.id ?? product.variants[0].id

  // Use local state to manage active variant
  const [activeVariantID, setActiveVariantID] = useState(defaultVariantID)

  // Handle variant change
  const updateVariant = useCallback(
    (id) => {
      const isValidVariant = product.variants.find((v) => v.id == id)
      setActiveVariantID(isValidVariant ? id : defaultVariantID)
    },
    [product.variants, defaultVariantID]
  )

  return product ? (
    <ProductHero
      product={product}
      type={'feature'}
      onVariantChange={updateVariant}
      activeVariant={product.variants.find((v) => v.id == activeVariantID)}
    />
  ) : (
    <></>
  )
}

export default FeaturedProducts
