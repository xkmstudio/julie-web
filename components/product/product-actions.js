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
      {type == 'feature' ? (
        activeVariant?.inStock && !activeVariant?.forceOutOfStock ? (
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
            className="btn is-add is-large flex items-center justify-center gap-5 flex-[1_1_0%] min-w-0"
          >
              <div className="flex items-center gap-5 min-w-0">
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
          ) : (
            <div className="btn is-add is-large flex flex-col gap-10 flex-[1_1_0%] min-w-0">
              Out of Stock
            </div>
          )
        ) : (
          <div className="product--actions">
            {activeVariant?.inStock && !activeVariant?.forceOutOfStock ? (
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
                className="btn is-add is-large flex items-center justify-center gap-5 w-full"
              >
                <div className="flex items-center gap-5 min-w-0">
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
            ) : (
              <div className="btn is-add is-large flex flex-col gap-10 w-full">
                Out of Stock
              </div>
            )}
          </div>
        )}
    </>
  )
}

export default ProductActions
