import React from 'react'

import { ProductOption } from '@components/product'

const ProductForm = ({ product, type, activeVariant, onVariantChange, hideSizeOption = false }) => {
  if (!product?.options?.length) return null

  // Filter out size option if hideSizeOption is true
  const optionsToShow = hideSizeOption
    ? product.options.filter((opt) => opt.name.toLowerCase() !== 'size')
    : product.options

  if (!optionsToShow.length) return null
  
  return (
    <div className="product--options flex flex-col items-center gap-15 mb-20">
      {optionsToShow.map(
        (option, key) =>
          option.values?.length > 0 && (
            <ProductOption
              key={key}
              position={key}
              option={option}
              optionsAmount={product.options.length}
              variants={product.variants}
              activeVariant={activeVariant}
              onChange={onVariantChange}
              type={type}
            />
          )
      )}
    </div>
  )
}

export default ProductForm
