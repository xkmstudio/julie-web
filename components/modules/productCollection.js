import React, { useEffect, useRef } from 'react'

import { AnimatePresence, m } from 'framer-motion'

import { useInView } from 'react-intersection-observer'

import cx from 'classnames'

import Media from '@components/media'
import NextLink from 'next/link'

import {
  ProductGallery,
  ProductForm,
  ProductActions,
  ProductPrice,
} from '@components/product'

const ProductCollection = ({ data }) => {
  const { products } = data

  return (
    <section className={`px-15`}>
      <div className='w-full h-full grid-standard border-l border-cement py-15'>
        {products?.map((product, key) => (
          <NextLink key={key} href={`/products/${product.slug}`} className="col-span-3">
            <div className="w-full h-full">
              <div className="w-full pb-[150%] relative">
                <Media
                  media={product.productThumbnail?.content}
                  width={1600}
                  srcSizes={[800, 1000, 1200, 1600]}
                  sizes="100%"
                  layout={'fill'}
                  className={'absolute top-0 left-0 h-full w-full object-cover'}
                />
                <img
                  className={cx(`pointer-events-none absolute -top-1`, {
                    '-left-1 w-[36%]': key == 0,
                    '-right-1 w-[33%]': key == 1,
                    '-left-1 w-[33%]': key == 2,
                    '-right-1': key == 3,
                  })}
                  src={`/icons/tear_${key + 1}.svg`}
                  alt={`Tear ${key + 1}`}
                />
                <div className='absolute z-2 bottom-0 left-0 w-full h-full flex items-end justify-between p-10 text-white mix-blend-difference'>
                  <div>[</div>
                  <div>{product.subtitle}</div>
                  <div>]</div>
                </div>
              </div>
  
              <div className='mt-10 flex justify-between items-center px-10'>
                <h3 className="title-normal">{product.title}</h3>
                <div><ProductPrice price={product.price} comparePrice={product.comparePrice} /></div>
              </div>
            </div>
          </NextLink>
        ))}
      </div>
    </section>
  )
}

export default ProductCollection
