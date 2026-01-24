import React, { useState } from 'react'

import {
  ProductCounter,
  ProductAdd,
  ProductWaitlist,
  ProductPrice,
  product,
} from '@components/product'

import Newsletter from '@components/newsletter'

const ProductActions = ({
  activeVariant,
  klaviyoAccountID,
  product,
  type,
  onAddToCart,
  toolkitIncluded,
  toolkitProductID,
}) => {
  // set default quantity
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <div
        className={`product--actions flex-shrink-0${
          type == 'feature' ? '' : ''
        }`}
      >
        {activeVariant?.inStock && !activeVariant?.forceOutOfStock ? (
          <>
            <ProductAdd
              type={type}
              slug={product.slug}
              productID={activeVariant.id}
              quantity={quantity}
              waitlist={product.waitlist}
              preOrder={product.preOrder}
              product={product}
              onAddToCart={onAddToCart}
              toolkitIncluded={toolkitIncluded}
              toolkitProductID={toolkitProductID}
              className={`btn is-add is-block flex items-center gap-5${type == 'feature' ? ' w-full' : ''}`}
            >
              <div className="flex items-center gap-5 ">
                <span>{product?.preOrder ? 'Pre-Order' : 'Add to Cart'}</span>{' '}
                &mdash;{' '}
                <ProductPrice
                  price={activeVariant?.price || product.price}
                  comparePrice={
                    activeVariant?.comparePrice || product.comparePrice
                  }
                />
              </div>
            </ProductAdd>
          </>
        ) : (
          <div className="btn is-add w-full flex flex-col gap-10">
            Out of Stock
          </div>
        )}
      </div>
    </>
  )
}

export default ProductActions
