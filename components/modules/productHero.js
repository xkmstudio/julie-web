import React, { useEffect, useRef } from 'react'

import { AnimatePresence, m } from 'framer-motion'

import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Icon from '@components/icon'
import Photo from '@components/photo'
import NextLink from 'next/link'
import AccordionList from '@components/accordion-list'
import Link from '@components/link'

import {
  ProductGallery,
  ProductForm,
  ProductActions,
  ProductPrice,
} from '@components/product'

import { useSiteContext } from '@lib/context'
import { useWindowSize } from '@lib/helpers'

const ProductIcon = ({ item, index, className }) => {
  const icon = item.icon
  if (!icon) return null

  // Check if it's an SVG by checking mimeType
  const mimeType = icon?.type || icon?.asset?.mimeType
  const isSVG = mimeType?.includes('svg') || mimeType === 'image/svg+xml'

  // Get the URL - for SVGs use direct URL, for others use Photo component
  const iconUrl = isSVG && icon?.url 
    ? icon.url
    : null

  const iconContent = isSVG ? (
    <img
      src={iconUrl}
      alt={icon?.alt || ''}
      className={className}
    />
  ) : (
    <Photo
      photo={icon}
      width={1600}
      srcSizes={[800, 1000, 1200, 1600]}
      sizes="100%"
      layout={'intrinsic'}
      className={className}
    />
  )

  return item.link ? (
    <NextLink
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
      key={index}
    >
      {iconContent}
    </NextLink>
  ) : (
    <React.Fragment key={index}>
      {iconContent}
    </React.Fragment>
  )
}

const ProductHero = ({ product, activeVariant, onVariantChange, type }) => {
  const [scrollRef, inView] = useInView({ threshold: 0, triggerOnce: true })

  const { isPageTransition } = useSiteContext()
  const { width } = useWindowSize()

  const icon = useRef()
  const containerRef = useRef()

  return (
    <div
      ref={containerRef}
      className={`product md:h-screen md:min-h-[60rem] px-15 md:px-25 pb-[2.5rem] pt-[calc(var(--headerHeight)+2.5rem)]`}
    >
      <div className={`w-full h-full flex flex-col md:flex-row gap-15 md:gap-25`}>
        <div className={`w-full h-[100vw] md:h-full`}>
          <div className="w-full h-full relative z-2">
            {(activeVariant?.galleryImages &&
            activeVariant.galleryImages.length > 0
              ? activeVariant.galleryImages
              : product.defaultGallery) && (
              <ProductGallery
                slides={
                  activeVariant?.galleryImages &&
                  activeVariant.galleryImages.length > 0
                    ? activeVariant.galleryImages
                    : product.defaultGallery
                }
                hasArrows
                hasCounter
              />
            )}
          </div>
        </div>

        <div className={`w-full col-span-12 md:col-span-6 flex flex-col pt-15 md:py-50${product.drawers?.length > 0 ? ' justify-start' : ' justify-center'}`}>
          <div className={`w-full max-w-[50rem] md:mx-auto pt-10 md:pt-0 flex flex-col flex-1${product.drawers?.length > 0 ? ' justify-start' : ' justify-center'}`}>
            <div className="">
              <div className="mb-20 md:mb-20 flex flex-col items-center text-center gap-15 md:gap-10">
                {product.subtitle && (
                  <div className="subtitle-lg">{product.subtitle}</div>
                )}
                <h1 className="title-2xl">{product.title}</h1>


                {product.description && (
                  <div className="md:mt-10 body-medium leading-130 product-description">
                    <BlockContent blocks={product.description} />
                  </div>
                )}
                {product.icons && product.icons.length > 0 && (
                  <div className="my-10 flex gap-30">
                    {product.icons.map((icon, key) => (
                      <ProductIcon
                        className="h-[2rem]"
                        item={icon}
                        index={key}
                      />
                    ))}
                  </div>
                )}
              </div>

              <ProductForm
                product={product}
                activeVariant={activeVariant}
                onVariantChange={onVariantChange}
                className="product--form"
              />
            </div>

            <div className="flex flex-col gap-10 sticky bottom-0">
              <ProductActions
                product={product}
                type={'feature'}
                activeVariant={activeVariant}
                klaviyoAccountID={product.klaviyoAccountID}
              />
              {product.additionalLinks &&
                product.additionalLinks.length > 0 && (
                  <div className="flex flex-col gap-10">
                    {product.additionalLinks.map((link) => (
                      <Link
                        key={link._key}
                        link={link}
                        hasArrow={true}
                        className="w-full btn is-outline is-large"
                      />
                    ))}
                  </div>
                )}
            </div>
            {product.drawers && product.drawers.length > 0 && (
              <div className="mt-25 md:mt-30">
                <AccordionList items={product.drawers} type="product" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductHero
