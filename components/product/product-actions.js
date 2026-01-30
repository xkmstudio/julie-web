import React, { useState } from 'react'

import {
  ProductCounter,
  ProductAdd,
  ProductWaitlist,
  ProductPrice,
  product,
} from '@components/product'

import Newsletter from '@components/newsletter'
import Link from '@components/link'

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

  // Check if add to cart is disabled and additional links should be shown instead
  const showBuyLinks = product?.disableAddToCart && product?.additionalLinks && product.additionalLinks.length > 0

  // Render additional links as buy links if add to cart is disabled
  if (showBuyLinks) {
    return (
      <div className="flex flex-col gap-10">
        {product.additionalLinks.map((link, index) => (
          <Link
            key={link._key || index}
            link={link}
            className={`btn is-large flex items-center justify-center gap-5 ${
              type === 'feature' ? 'flex-[1_1_0%] min-w-0' : 'w-full'
            } ${index === 0 ? 'is-add' : 'is-outline'}`}
          />
        ))}
      </div>
    )
  }

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
