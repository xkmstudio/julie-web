import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useWindowSize } from '@lib/helpers'
import cx from 'classnames'

const MOBILE_BREAKPOINT = 850

/**
 * Component that wraps a title and adds horizontal scroll animation
 * when the text overflows on desktop
 */
const ScrollingTitle = ({ children, className = '', as: Component = 'h2', titleClassName = '' }) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const checkTimeoutRef = useRef(null)
  const { width } = useWindowSize()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT

  const checkOverflow = useCallback(() => {
    if (isMobile || !containerRef.current || !textRef.current) {
      setIsOverflowing(false)
      return
    }

    const container = containerRef.current
    const text = textRef.current

    if (!container || !text) return

    // Create a temporary span to measure text width without affecting layout
    const measureSpan = document.createElement('span')
    measureSpan.style.position = 'absolute'
    measureSpan.style.visibility = 'hidden'
    measureSpan.style.whiteSpace = 'nowrap'
    measureSpan.style.display = 'inline-block'
    measureSpan.style.width = 'auto'
    measureSpan.style.maxWidth = 'none'
    measureSpan.textContent = text.textContent || text.innerText
    
    // Copy computed styles for accurate measurement
    const computedStyle = window.getComputedStyle(text)
    measureSpan.style.fontSize = computedStyle.fontSize
    measureSpan.style.fontFamily = computedStyle.fontFamily
    measureSpan.style.fontWeight = computedStyle.fontWeight
    measureSpan.style.letterSpacing = computedStyle.letterSpacing
    measureSpan.style.padding = computedStyle.padding
    measureSpan.style.margin = computedStyle.margin
    
    document.body.appendChild(measureSpan)
    
    const containerWidth = container.clientWidth
    const textWidth = measureSpan.offsetWidth
    
    document.body.removeChild(measureSpan)

    // Check if text overflows (with a small threshold to account for rounding)
    const overflow = textWidth > containerWidth + 1

    setIsOverflowing((prev) => {
      // Only update if state actually changed to prevent unnecessary re-renders
      if (prev !== overflow) {
        // Set CSS variable for animation calculation
        if (overflow && container) {
          const gradientWidth = 60 // Half of gradient width for partial reveal
          // Scroll enough to show more text past the gradient, but not fully
          const scrollDistance = textWidth - containerWidth + gradientWidth
          container.style.setProperty('--title-scroll-distance', `${scrollDistance}px`)
        } else {
          container?.style.removeProperty('--title-scroll-distance')
        }
        return overflow
      }
      return prev
    })
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      setIsOverflowing(false)
      return
    }

    // Debounce the check to prevent constant updates
    const scheduleCheck = () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
      checkTimeoutRef.current = setTimeout(() => {
        checkOverflow()
      }, 150)
    }

    // Initial check
    scheduleCheck()

    // Recheck on resize with debouncing
    const resizeObserver = new ResizeObserver(() => {
      scheduleCheck()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [isMobile, checkOverflow, children])

  return (
    <div ref={containerRef} className={cx('scrolling-title-container', className)}>
      <Component
        ref={textRef}
        className={cx('scrolling-title-text', titleClassName, {
          'is-overflowing': isOverflowing,
        })}
      >
        {children}
      </Component>
      {isOverflowing && (
        <div className="scrolling-title-gradient" />
      )}
    </div>
  )
}

export default ScrollingTitle

