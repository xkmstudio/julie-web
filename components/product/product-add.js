import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import FocusTrap from 'focus-trap-react'

import { useRouter } from 'next/router'

import { useSiteContext, useAddItem } from '@lib/context'
import { centsToPrice } from '@lib/helpers'

import Icon from '@components/icon'
import { AnimatePresence, m } from 'framer-motion'

import { useCheckout } from '@lib/context'

const ProductAdd = ({
  productID,
  quantity = 1,
  className,
  children,
  preOrder,
  slug,
  product,
  limited,
  customerCode,
  type,
  onAddToCart,
  toolkitIncluded,
  toolkitProductID,
}) => {
  const addItemToCart = useAddItem()
  const {
    shopifyClient,
    isLoading,
    isAdding,
    checkout,
    isCartOpen,
    productCounts,
  } = useSiteContext()
  const router = useRouter()

  const isAvailable = !product?.soldOut

  const handleClick = async () => {
    if (!isAvailable) return

    // If custom onAddToCart handler is provided, use it
    if (onAddToCart) {
      await onAddToCart()
    } else {
      // Otherwise use default behavior
      addItemToCart(productID, quantity)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isLoading ? (
          <button className={cx('is-disabled', className)} disabled>
            Loading...
          </button>
        ) : (
          <button
            className={cx(`group`, className, {
              'is-disabled': !isAvailable,
              'is-feature': type == 'feature',
            })}
            onClick={handleClick}
          >
            <div className="flex items-center gap-5 blink group-hover:opacity-100">
              {isAvailable
                ? isAdding
                  ? 'Adding...'
                  : product?.preOrder
                  ? `Pre-Order — $${centsToPrice(product?.price)}`
                  : `Add to Cart — $${centsToPrice(product?.price)}`
                : 'Unavailable'}
            </div>
          </button>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProductAdd
