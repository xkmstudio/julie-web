import React, { useState, useEffect } from 'react'
import FocusTrap from 'focus-trap-react'
import { m } from 'framer-motion'
import cx from 'classnames'

import { centsToPrice } from '@lib/helpers'

import {
  useSiteContext,
  useCartTotals,
  useCartCount,
  useCartItems,
  useCheckout,
  useEnhancedCheckout,
  useToggleCart,
} from '@lib/context'

import CartItem from '@components/cart-item'

const Cart = ({ data }) => {
  const { shop } = data

  if (!shop) return null

  const { isCartOpen, isUpdating } = useSiteContext()
  const { subTotal } = useCartTotals()
  const cartCount = useCartCount()
  const lineItems = useCartItems()
  const checkoutURL = useCheckout()
  const enhancedCheckout = useEnhancedCheckout()
  const toggleCart = useToggleCart()

  const [hasFocus, setHasFocus] = useState(false)
  const [checkoutLink, setCheckoutLink] = useState(checkoutURL)

  const handleKeyDown = (e) => {
    if (e.which === 27) {
      toggleCart(false)
    }
  }

  const goToCheckout = async (e) => {
    e.preventDefault()
    toggleCart(false)

    try {
      // Use enhanced checkout to update cart attributes with UTM parameters
      const finalCheckoutURL = await enhancedCheckout()

      setTimeout(() => {
        window.open(finalCheckoutURL || checkoutLink, '_self')
      }, 200)
    } catch (error) {
      console.warn('Failed to enhance checkout:', error)
      setTimeout(() => {
        window.open(checkoutLink, '_self')
      }, 200)
    }
  }

  // update our checkout URL to use our custom domain name
  useEffect(() => {
    if (checkoutURL) {
      const buildCheckoutLink = shop.storeURL
        ? checkoutURL.replace(
            /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g,
            shop.storeURL
          )
        : checkoutURL

      // Append the discount code if it exists
      const discountCode = data?.header?.banner?.discountCode
      const checkoutWithDiscount = discountCode
        ? `${buildCheckoutLink}&discount=${discountCode}`
        : buildCheckoutLink

      setCheckoutLink(checkoutWithDiscount)
    }
  }, [checkoutURL])

  return (
    <>
      <FocusTrap
        active={isCartOpen && hasFocus}
        focusTrapOptions={{ allowOutsideClick: true }}
      >
        <m.div
          initial="hide"
          animate={isCartOpen ? 'show' : 'hide'}
          variants={{
            show: {
              x: '0%',
            },
            hide: {
              x: '100%',
            },
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onKeyDown={(e) => handleKeyDown(e)}
          onAnimationComplete={(v) => setHasFocus(v === 'show')}
          className={cx('cart flex', {
            'is-active': isCartOpen,
            'is-updating': isUpdating,
          })}
        >
          <div
            onClick={() => toggleCart(false)}
            className="hidden md:block close-zone w-full h-full flex-1 cursor-pointer"
          ></div>
          <div className="cart--inner flex-shrink-0">
            <div className="cart--header">
              <div className="cart--title">
                Cart [
                <span className="cart--count px-[.2rem]">{cartCount}</span>]
              </div>
              <button
                className="cart-toggle p-10 md:p-15 pb-10 md:pb-10 btn-text"
                onClick={() => toggleCart(false)}
              >
                X
              </button>
            </div>

            <div className="cart--content">
              {lineItems.length > 0 ? (
                <CartItems items={lineItems} />
              ) : (
                <>
                  <EmptyCart />
                </>
              )}
            </div>

            {lineItems?.length > 0 && (
              <div className="cart--footer">
                <div className="cart--subtotal mb-15 px-10 md:px-15">
                  <span>Subtotal</span>
                  <span>${centsToPrice(subTotal * 100)}</span>
                </div>

                <a
                  href={checkoutLink}
                  onClick={(e) => goToCheckout(e)}
                  className="btn is-primary is-large is-white is-checkout"
                >
                  {isUpdating ? 'Updating...' : 'Checkout >'}
                </a>

                {shop.cartMessage && (
                  <div className="cart--message">{shop.cartMessage}</div>
                )}
              </div>
            )}
          </div>
        </m.div>
      </FocusTrap>

      <div
        className={cx('cart--backdrop', {
          'is-active': isCartOpen,
        })}
        onClick={() => toggleCart(false)}
      />
    </>
  )
}

const CartItems = ({ items }) => {
  return (
    <div className="cart--items">
      {items.map((item) => {
        return <CartItem key={item.id} item={item} />
      })}
    </div>
  )
}

const EmptyCart = () => (
  <div className="cart--empty">
    <p>Your cart is empty</p>
  </div>
)

export default Cart
