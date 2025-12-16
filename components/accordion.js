import React, { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import cx from 'classnames'

import Icon from '@components/icon'

const accordionAnim = {
  open: {
    opacity: 1,
    height: 'auto',
  },
  closed: {
    opacity: 0,
    height: 0,
  },
}

const EXTRA_TITLE_PADDING = 35

const Accordion = ({
  id,
  index,
  title,
  isOpen = false,
  isControlled = false,
  onToggle = () => {},
  className,
  children,
}) => {
  const [hasFocus, setHasFocus] = useState(isOpen)
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false)
  const [titleOverflowOffset, setTitleOverflowOffset] = useState(0)
  const titleWrapperRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const wrapperEl = titleWrapperRef.current
    const textEl = titleRef.current

    if (
      typeof window === 'undefined' ||
      !wrapperEl ||
      !textEl
    ) {
      return undefined
    }

    const evaluateOverflow = () => {
      const rawOverflow =
        textEl.scrollWidth - wrapperEl.clientWidth
      const hasOverflow = rawOverflow > -EXTRA_TITLE_PADDING
      const overflowAmount = hasOverflow
        ? Math.max(0, rawOverflow + EXTRA_TITLE_PADDING)
        : 0

      setIsTitleOverflowing((prev) =>
        prev === hasOverflow ? prev : hasOverflow
      )

      setTitleOverflowOffset((prev) =>
        prev === overflowAmount ? prev : overflowAmount
      )
    }

    evaluateOverflow()

    window.addEventListener('resize', evaluateOverflow)

    let resizeObserver

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(evaluateOverflow)
      resizeObserver.observe(wrapperEl)
      resizeObserver.observe(textEl)
    }

    return () => {
      window.removeEventListener('resize', evaluateOverflow)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [title])

  return (
    <div
      key={id}
      className={cx(
        'accordion overflow-hidden border-b border-cement',
        className
      )}
    >
      {!isControlled && (
        <button
          onClick={() => onToggle(id, !isOpen)}
          aria-expanded={isOpen}
          aria-controls={`accordion-${id}`}
          className={cx(
            'relative accordion--toggle w-full grid-standard px-0 text-left group',
            { 'is-open': isOpen }
          )}
        >
          <div
            className={cx(
              'scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.16, 1, 0.3, 1)] absolute bottom-0 left-0 w-full h-full md:h-[3rem] bg-white mix-blend-difference z-2',
              isOpen ? 'scale-y-100' : 'group-hover:scale-y-100'
            )}
          ></div>
          <div className="hidden md:flex relative z-3 translate-y-1">
            <div className="col-span-1">
              <div className="text-11 w-30 h-30 flex items-center justify-center bg-black text-white">
                {index < 9 ? `0${index + 1}` : index + 1}
              </div>
            </div>
          </div>

          {title && (
            <div className="block pt-10 pb-10 md:pb-4 col-span-12 md:col-span-7 uppercase leading-100 pl-10 md:pl-0">
              <div
                ref={titleWrapperRef}
                className={cx('accordion--title-wrapper', {
                  'is-overflowing': isTitleOverflowing,
                })}
              >
                <span
                  ref={titleRef}
                  className={cx('accordion--title', {
                    'is-overflowing': isTitleOverflowing,
                  })}
                  style={
                    isTitleOverflowing
                      ? {
                          '--accordion-title-offset': `${titleOverflowOffset}px`,
                        }
                      : undefined
                  }
                >
                  {title}
                </span>
              </div>
            </div>
          )}

          <div className="absolute right-0 top-10 md:top-1/2 md:-translate-y-1/2 flex items-start md:items-center justify-start md:justify-center pt-0 md:pt-5">
            <span
              style={{
                transform: isOpen ? 'rotate(270deg)' : 'rotate(90deg)',
              }}
              className={`flex items-center justify-center w-30 h-[fit-content] md:h-30 transition-transform duration-300`}
            >
              <div>{`>`}</div>
            </span>
          </div>
        </button>
      )}

      <m.div
        id={`accordion-${id}`}
        className="accordion--content grid-standard"
        initial={isOpen ? 'open' : 'closed'}
        animate={isOpen ? 'open' : 'closed'}
        variants={accordionAnim}
        transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
        onAnimationComplete={(v) => setHasFocus(v === 'open')}
      >
        <div className="col-span-12 md:col-span-7 md:col-start-2" hidden={!isOpen && !hasFocus}>
          <div className="pt-10 pb-15 pl-10 md:pl-0">
            <div className="">{children}</div>
          </div>
        </div>
      </m.div>
    </div>
  )
}

export default Accordion
