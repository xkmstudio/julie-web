import React, { useEffect, useRef, useState } from 'react'

import { AnimatePresence, m } from 'framer-motion'

import { useInView } from 'react-intersection-observer'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin'
gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

import BlockContent from '@components/block-content'
import Icon from '@components/icon'
import Photo from '@components/photo'
import NextLink from 'next/link'
import cx from 'classnames'
import Media from '@components/media'

import {
  ProductGallery,
  ProductForm,
  ProductActions,
  ProductPrice,
  SizingChart,
  Product3DViewer,
} from '@components/product'

import {
  useSiteContext,
  useAddItem,
  useRemoveItem,
  useCartItems,
} from '@lib/context'
import { useWindowSize } from '@lib/helpers'
import Drawer from '@components/drawer'
import RadioGroup from '@components/radio-group'
import RadioItem from '@components/radio-item'
import { hasObject } from '@lib/helpers'

const ProductHero = ({
  product,
  activeVariant,
  onVariantChange,
  modules,
  type,
}) => {
  const [scrollRef, inView] = useInView({ threshold: 0, triggerOnce: true })

  const { isPageTransition } = useSiteContext()
  const { width } = useWindowSize()
  const addItem = useAddItem()
  const removeItem = useRemoveItem()
  const cartItems = useCartItems()

  const icon = useRef()
  const containerRef = useRef()

  // Drawer states
  const [sizingDrawerOpen, setSizingDrawerOpen] = useState(false)
  const [materialsDrawerOpen, setMaterialsDrawerOpen] = useState(false)

  // Toolkit state - default to included (true)
  const [toolkitIncluded, setToolkitIncluded] = useState(true)

  // Get size option
  const sizeOption = product?.options?.find(
    (opt) => opt.name.toLowerCase() === 'size'
  )

  // Get toolkit product ID from product settings (this should be configured)
  const toolkitProductID = product?.toolkitProductID

  // Handle toolkit toggle - just toggle the state, don't add/remove from cart yet
  const handleToolkitToggle = () => {
    setToolkitIncluded(!toolkitIncluded)
  }

  // Handle adding product with toolkit if included
  const handleAddToCart = async () => {
    if (!activeVariant?.id) return

    try {
      // Add main product first
      await addItem(activeVariant.id, 1)

      // If toolkit is included, add it silently after main product succeeds
      if (toolkitIncluded && toolkitProductID) {
        // Small delay to ensure main product is fully processed
        setTimeout(() => {
          addItem(String(toolkitProductID), 1, { silent: true })
        }, 200)
      }
    } catch (error) {
      console.error('Error adding product to cart:', error)
      // Don't add toolkit if main product fails
    }
  }

  // Handle scroll to section
  const scrollToSection = (sectionId) => {
    // Try to find element by ID first
    let element = document.getElementById(sectionId)

    // If not found, try to find by data attribute or class
    if (!element) {
      element = document.querySelector(`[data-section="${sectionId}"]`)
    }

    // If still not found, try to find by module type
    if (!element && modules) {
      const moduleIndex = modules.findIndex((m) => {
        if (sectionId === 'tutorial') {
          return (
            m._type === 'tutorial' ||
            m.title?.toLowerCase().includes('tutorial')
          )
        }
        if (sectionId === 'contents') {
          return (
            m._type === 'productContents' ||
            m.title?.toLowerCase().includes('contents')
          )
        }
        return false
      })

      if (moduleIndex !== -1) {
        // Find all sections and scroll to the one at the module index
        const sections = document.querySelectorAll('section')
        if (sections[moduleIndex + 1]) {
          // +1 to skip productHero section
          element = sections[moduleIndex + 1]
        }
      }
    }

    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: element,
        },
        ease: 'power2.inOut',
      })
    }
  }

  // Find tutorial and contents sections in modules
  const tutorialSection = modules?.find(
    (m) => m._type === 'tutorial' || m.title?.toLowerCase().includes('tutorial')
  )
  const contentsSection = modules?.find(
    (m) =>
      m._type === 'productContents' ||
      m.title?.toLowerCase().includes('contents')
  )

  // Handle size change
  const handleSizeChange = (sizeValue) => {
    if (!sizeOption) return

    const newOptions = activeVariant.options.map((opt) =>
      opt.name.toLowerCase() === 'size' ? { ...opt, value: sizeValue } : opt
    )

    const newVariant = product.variants.find((variant) =>
      variant.options.every((opt) => hasObject(newOptions, opt))
    )

    if (newVariant && onVariantChange) {
      onVariantChange(newVariant.id)
    }
  }

  // Get current size value
  const currentSize = activeVariant?.options?.find(
    (opt) => opt.name.toLowerCase() === 'size'
  )?.value

  return (
    <div
      ref={containerRef}
      className={`product md:h-screen md:min-h-[60rem] text-black md:text-white relative w-full`}
    >
      {product.backgroundMedia && (
        <div className="w-full h-full absolute top-0 left-0 z-1">
          <Media
            media={product.backgroundMedia?.content}
            width={1920}
            srcSizes={[1920]}
            layout="fill"
            className="object-cover absolute top-0 left-0 w-full h-full"
          />
        </div>
      )}
      {product.tutorial && (
        <button onClick={() => scrollToSection('tutorial')} className='absolute z-3 bottom-0 left-0 p-10 md:p-15 w-[16.6667%]'>
          <video
            src={product.tutorial.video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full"
          />
        </button>
      )}
      <div className="w-full relative z-2 h-[120vw] md:h-full grid-standard">
        <div className="col-span-12 md:col-span-8 relative">
          {product.model3D ? (
            <Product3DViewer
              modelUrl={product.model3D}
              className="w-full h-full"
            />
          ) : (
            product.galleries?.map((gallery, key) => {
              return product.galleries.length == 1 ? (
                <ProductGallery
                  key={key}
                  id={key}
                  slides={product.galleries[0].images}
                  activeVariant={activeVariant}
                  hasArrows
                  hasCounter
                />
              ) : gallery.variants?.some(
                  (v) => v.variantID == activeVariant.id
                ) ? (
                <ProductGallery
                  key={key}
                  id={key}
                  slides={gallery.images}
                  activeVariant={activeVariant}
                  hasArrows
                  hasCounter
                />
              ) : null
            })
          )}
          <div className=''>

          </div>
        </div>
      </div>

      <div className="md:absolute z-2 top-60 right-0 pr-15 w-full md:w-[calc(33.33333vw-.5rem)] px-10 md:px-0 md:pr-15 mt-20 md:mt-0">
        <div className="w-full md:bg-[rgba(0,0,0,.6)] md:border md:border-dim md:p-10">
          <div className="">
            <div className="flex flex-col items-start gap-15 md:gap-10">
              <div className="flex items-center justify-between w-full">
                <h1 className="title-xl">{product.title}</h1>
                <ProductPrice
                  price={activeVariant?.price || product.price}
                  comparePrice={
                    activeVariant?.comparePrice || product.comparePrice
                  }
                />
              </div>

              {product.description && (
                <div className="mt-10 md:mt-15 body-medium leading-130 product-description">
                  <BlockContent blocks={product.description} />
                </div>
              )}

              {/* INFO Section with toggles */}
              <div className="mt-20 flex flex-col gap-10">
                <div className="uppercase">INFO:</div>
                <div className="flex flex-wrap gap-15 items-center">
                  <button
                    onClick={() => setSizingDrawerOpen(true)}
                    className="uppercase hover:underline flex items-center gap-5"
                  >
                    SIZING <span className="text-16">+</span>
                  </button>
                  <button
                    onClick={() => setSizingDrawerOpen(true)}
                    className="uppercase hover:underline flex items-center gap-5"
                  >
                    MATERIALS <span className="text-16">+</span>
                  </button>
                  {tutorialSection && (
                    <button
                      onClick={() => scrollToSection('tutorial')}
                      className="uppercase hover:underline flex items-center gap-5"
                    >
                      TUTORIAL <span className="text-16">⌄</span>
                    </button>
                  )}
                  {contentsSection && (
                    <button
                      onClick={() => scrollToSection('contents')}
                      className="uppercase hover:underline flex items-center gap-5"
                    >
                      CONTENTS <span className="text-16">⌄</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative md:absolute z-2 bottom-0 right-0 pr-15 w-full md:w-[calc(33.33333vw-.5rem)] px-10 md:pl-0 md:pr-15 mt-30 md:mt-0">
        <div className="w-full flex flex-col gap-10">
          {/* Optional Toolkit Toggle */}
          {toolkitProductID && Number(toolkitProductID) > 0 && (
            <button
              onClick={handleToolkitToggle}
              className={cx(
                'flex items-center justify-between gap-10 w-full border md:border-dim transition-colors text-left md:bg-[rgba(0,0,0,.5)]'
              )}
              aria-label={toolkitIncluded ? 'Remove toolkit' : 'Add toolkit'}
            >
              <div
                className={cx(
                  'w-30 h-30 flex items-center justify-center border transition-colors flex-shrink-0',
                  toolkitIncluded
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent border-dim'
                )}
              >
                {toolkitIncluded && <span>×</span>}
              </div>
              <span className="uppercase pr-10">OPTIONAL TOOL KIT</span>
            </button>
          )}

          {/* Size Options */}
          {sizeOption && sizeOption.values?.length > 0 && (
            <div className="flex flex-col gap-10">
              <div className="text-smoke uppercase mb-5 hidden">Size:</div>
              <RadioGroup
                value={currentSize}
                onChange={handleSizeChange}
                className="flex flex-wrap gap-10 mix-blend-difference"
              >
                {sizeOption.values.map((size, key) => (
                  <RadioItem
                    key={key}
                    value={size}
                    title={`Select size ${size}`}
                    className={cx(
                      'px-15 py-8 border border-dim bg-[rgba(0,0,0,.5)] uppercase transition-colors flex-1',
                      currentSize === size
                        ? 'bg-white text-black'
                        : 'bg-transparent text-white hover:bg-white hover:text-black'
                    )}
                  >
                    {size}
                  </RadioItem>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Other product options (non-size) */}
          <ProductForm
            product={product}
            activeVariant={activeVariant}
            onVariantChange={onVariantChange}
            className="product--form"
            hideSizeOption={true}
          />

          {/* Add to Cart */}
          <div className="flex flex-col gap-10">
            <ProductActions
              product={product}
              type={'feature'}
              activeVariant={activeVariant}
              klaviyoAccountID={product.klaviyoAccountID}
              onAddToCart={handleAddToCart}
              toolkitIncluded={toolkitIncluded}
              toolkitProductID={toolkitProductID}
            />
          </div>
        </div>
      </div>

      {/* Sizing Drawer */}
      <Drawer
        direction="right"
        isOpen={sizingDrawerOpen}
        onClose={() => setSizingDrawerOpen(false)}
        title="PRODUCT DETAILS"
      >
        <div className="flex flex-col gap-30">
          {/* Sizing Chart */}
          {product.sizingChart && (
            <div>
              <SizingChart chartData={product.sizingChart} />
            </div>
          )}

          {/* Product Detail Images */}
          {product.detailImages && (
            <div>
              <div className="grid grid-cols-4 gap-10">
                {product.detailImages.left && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-cement text-center title-normal py-5">
                      Left
                    </div>

                    <div className="w-full pb-[150%] relative overflow-hidden">
                      <Photo
                        photo={product.detailImages.left}
                        width={400}
                        srcSizes={[400]}
                        layout="fill"
                        className="object-cover absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {product.detailImages.front && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-cement text-center title-normal py-5">
                      FRONT
                    </div>

                    <div className="w-full pb-[150%] relative overflow-hidden">
                      <Photo
                        photo={product.detailImages.front}
                        width={400}
                        srcSizes={[400]}
                        layout="fill"
                        className="object-cover absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {product.detailImages.right && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-cement text-center title-normal py-5">
                      RIGHT
                    </div>

                    <div className="w-full pb-[150%] relative overflow-hidden">
                      <Photo
                        photo={product.detailImages.right}
                        width={400}
                        srcSizes={[400]}
                        layout="fill"
                        className="object-cover absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {product.detailImages.back && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-cement text-center title-normal py-5">
                      Back
                    </div>

                    <div className="w-full pb-[150%] relative overflow-hidden">
                      <Photo
                        photo={product.detailImages.back}
                        width={400}
                        srcSizes={[400]}
                        layout="fill"
                        className="object-cover absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materials content - this should come from product data */}
          {product.materialsInfo && (
            <div>
              <h3 className="title-normal uppercase mb-15">MATERIALS</h3>
              <div className="">
                <BlockContent blocks={product.materialsInfo} />
              </div>
            </div>
          )}

          {/* Shipping */}
          {product.shippingInfo && (
            <div>
              <h3 className="title-normal uppercase mb-15">Shipping</h3>
              <div className="">
                <BlockContent blocks={product.shippingInfo} />
              </div>
            </div>
          )}

          {/* Returns */}
          {product.returnsInfo && (
            <div>
              <h3 className="title-normal uppercase mb-15">Returns</h3>
              <div className="">
                <BlockContent blocks={product.returnsInfo} />
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}

export default ProductHero
