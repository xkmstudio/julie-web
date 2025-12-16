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
        className={`product--actions${
          type == 'feature' || type == 'lab' ? ' w-full' : ''
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
              className={`btn is-add is-block flex items-center gap-5`}
            >
              <div className="flex items-center gap-5 blink">
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
          <div className="w-full flex flex-col gap-10">
            <div className="subtitle-small text-smoke">Out of Stock</div>
            <div className="w-full md:w-full flex-shrink-0 mt-35 md:mt-0">
              <Newsletter type="product" />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProductActions
