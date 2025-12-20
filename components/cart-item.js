import React from 'react'
import Link from 'next/link'

import {
  useUpdateItem,
  useRemoveItem,
  useToggleCart,
  useSiteContext,
} from '@lib/context'

import { useRouter } from 'next/router'

import Media from '@components/media'
import Photo from '@components/photo'
import { ProductCounter, ProductPrice } from '@components/product'

function CartItem({ item }) {
  const removeItem = useRemoveItem()
  const updateItem = useUpdateItem()
  const toggleCart = useToggleCart()

  const router = useRouter()

  const changeQuantity = (quantity) => {
    updateItem(item.lineID, quantity)
  }

  // Use variant cart image if available, otherwise fall back to product thumbnail
  const cartImage = item.cartImage?.asset 
    ? item.cartImage
    : item.product.productThumbnail?.content

  return (
    <div className="cart-item">
        <div className="w-120 h-160 bg-cement relative overflow-hidden flex-shrink-0">
          {item.cartImage?.asset ? (
            <Photo
              photo={item.cartImage}
              srcSizes={[400]}
              layout="fill"
              className="w-full h-full absolute top-0 left-0 object-cover"
            />
          ) : (
            <Media
              media={cartImage}
              srcSizes={[400]}
              layout="fill"
              className="w-full h-full absolute top-0 left-0 object-cover"
            />
          )}
        </div>
      <div className="cart-item--details">
        <div className="cart-item--header">
          <div className="cart-item--title">
            <h2 className="cart-item--name">
              <Link
                onClick={() => toggleCart(false)}
                className="cart-item--link"
                href={`/products/${item.product.slug}?variant=${item.id}`}
                scroll={false}
              >
                {item.product.title}
              </Link>
            </h2>
            {item.subtitle && (
              <div className="cart-item--subtitle mt-5">{item.subtitle}</div>
            )}
            {item.title != 'Default Title' && (
              <div className="cart-item--variant mt-10">{item.title}</div>
            )}
            {item.product?.noteShipping && (
              <div className="cart-item--note mt-5">
                Pre-Order:
                <br /> {item.product?.noteShipping}
              </div>
            )}
          </div>
          <ProductPrice price={item.price} />
        </div>
        <div className="cart-item--tools border-t border-cement">
          <div className="cart-item--quantity w-3/4">
            <ProductCounter
              key={item.id}
              id={item.id}
              lineID={item.lineID}
              defaultCount={item.quantity}
              max={
                item.product.slug.includes('sol-reader') &&
                router.query?.betatester == 'TRUE'
                  ? 10
                  : item.product.slug.includes('sol-reader') &&
                    router.query?.betatester != 'TRUE'
                  ? 10
                  : 999
              }
              onUpdate={changeQuantity}
              removeItem={removeItem}
              className="is-small"
            />
          </div>
          <button onClick={() => removeItem(item.lineID)} className="btn-text cart-item--remove w-1/4">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartItem
