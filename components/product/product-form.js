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
    <div className="product--options flex flex-col gap-30">
      {optionsToShow.map(
        (option, key) =>
          option.values?.length > 0 && (
            <ProductOption
              key={key}
              position={key}
              option={option}
              swatches={product.swatches}
              optionsAmount={product.options.length}
              optionSettings={product.optionSettings}
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
