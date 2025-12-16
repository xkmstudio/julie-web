import React, { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import cx from 'classnames'
import useEmblaCarousel from 'embla-carousel-react'

import { InPortal, useWindowSize } from '../lib/helpers'

const Drawer = ({
  direction = 'right',
  isOpen = false,
  onClose = () => {},
  className,
  children,
  title,
}) => {
  const drawerRef = useRef()
  const contentRef = useRef()
  const [isActive, setIsActive] = useState(isOpen)
  const [hasFocus, setHasFocus] = useState(false)

  // Mobile carousel for drawer detail images (front, back, right, left)
  const MOBILE_BREAKPOINT = 950
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const showCarousel = isClient && isMobile

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    loop: true,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (showCarousel && isActive) {
      emblaApi?.reInit()
    }
  }, [emblaApi, showCarousel, isActive])

  useEffect(() => {
    setIsActive(isOpen)
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (e.which === 27) {
      onClose(false)
    }
  }

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      // Lock body scroll when drawer is open
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = null
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.documentElement.style.overflow = null
    }
  }, [isActive])

  return (
    <InPortal id="drawer">
      <>
        <FocusTrap
          active={isActive && hasFocus}
          focusTrapOptions={{
            fallbackFocus: () => drawerRef.current,
            allowOutsideClick: true,
          }}
        >
          <m.div
            initial="hide"
            animate={isActive ? 'show' : 'hide'}
            variants={{
              show: {
                x: '0%',
              },
              hide: {
                x: direction === 'right' ? '100%' : '-100%',
              },
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={(e) => handleKeyDown(e)}
            onAnimationComplete={(v) => setHasFocus(v === 'show')}
            className={cx('cart flex', className, {
              'is-active': isActive,
            })}
            style={{
              height: 'calc(var(--vh, 1vh) * 100)',
            }}
          >
            <div
              onClick={() => onClose(false)}
              className="hidden md:block close-zone w-full h-full flex-1 cursor-pointer"
            />
            <div ref={drawerRef} className="drawer--inner flex-shrink-0">
              {title && (
                <div className="drawer--header">
                  <div className="drawer--title p-10 md:p-15 pb-10 md:pb-10">{title}</div>
                  <button
                    className="drawer-toggle btn-text p-10 md:p-15 pb-10 md:pb-10"
                    onClick={() => onClose(false)}
                  >
                    x
                  </button>
                </div>
              )}
              <div ref={contentRef} className="drawer--content">
                {showCarousel && isActive ? (
                  <DrawerContentWithCarousel
                    children={children}
                    emblaRef={emblaRef}
                  />
                ) : (
                  children
                )}
              </div>
            </div>
          </m.div>
        </FocusTrap>

        <div
          className={cx('cart--backdrop', {
            'is-active': isOpen,
          })}
          onClick={() => onClose(false)}
        />
      </>
    </InPortal>
  )
}

// Component to transform grid-cols-4 layouts into carousel on mobile
const DrawerContentWithCarousel = ({ children, emblaRef }) => {
  const carouselRefUsed = useRef(false)
  
  const transformChildren = (node) => {
    if (!node || typeof node !== 'object') return node

    // Handle arrays
    if (Array.isArray(node)) {
      return node.map(transformChildren)
    }

    // Handle React elements
    if (node.props) {
      const { className, children: nodeChildren } = node.props
      const classNameStr = typeof className === 'string' ? className : ''

      // Check if this is a grid-cols-4 element
      if (classNameStr && classNameStr.includes('grid-cols-4') && !carouselRefUsed.current) {
        carouselRefUsed.current = true
        // Transform to carousel - hide grid on mobile, show carousel
        const updatedClassName = cx(classNameStr, 'hidden md:grid md:grid-cols-4')
        
        return (
          <>
            {/* Mobile carousel */}
            <div ref={emblaRef} className="w-full relative overflow-hidden md:hidden">
              <div className="flex">
                {React.Children.map(nodeChildren, (child, index) => {
                  if (child && child.props) {
                    const childClassName = typeof child.props.className === 'string' 
                      ? child.props.className 
                      : ''
                    return React.cloneElement(child, {
                      ...child.props,
                      key: index,
                      className: cx(childClassName, 'w-[83.333%] min-w-[83.333%]', {
                        'ml-10': index > 0,
                      }),
                    })
                  }
                  return child
                })}
              </div>
            </div>
            {/* Desktop grid */}
            {React.cloneElement(
              node,
              {
                ...node.props,
                className: updatedClassName,
              }
            )}
          </>
        )
      }

      // Recursively transform children
      if (nodeChildren) {
        return React.cloneElement(
          node,
          { ...node.props },
          React.Children.map(nodeChildren, transformChildren)
        )
      }
    }

    return node
  }

  return <>{React.Children.map(children, transformChildren)}</>
}

export default Drawer
