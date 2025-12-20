import React, { useState, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import cx from 'classnames'
import gsap from 'gsap'

import { useWindowSize } from '../lib/helpers'

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

const Accordion = ({
  id,
  index,
  title,
  type,
  openFirst,
  isOpen = false,
  isControlled = false,
  onToggle = () => {},
  className,
  children,
}) => {
  const [hasFocus, setHasFocus] = useState(isOpen)
  const drawerRef = useRef()

  const { width } = useWindowSize()

  useEffect(() => {
    if (openFirst) {
      onToggle(id, !isOpen)
    }
  }, [])

  return (
    <div
      key={id}
      ref={drawerRef}
      className={cx(
        `accordion overflow-hidden is-${type} bg-cement rounded-[1.5rem]`,
        className
      )}
    >
      {!isControlled && (
        <button
          onClick={() => {
            onToggle(id, !isOpen)
          }}
          aria-expanded={isOpen}
          aria-controls={`accordion-${id}`}
          className={cx(
            `accordion--toggle w-full flex justify-between items-center relative`,
            {
              'is-open': isOpen,
            }
          )}
        >
          <div className="w-full flex items-start gap-20 justify-between text-18 md:text-36 py-15 md:py-15 px-15">
            <div
              className={`text-left leading-100 ${
                type === 'faqs' ? 'title-lg' : ' font-lb uppercase text-12'
              }`}
            >
              {title}
            </div>

            <div
              className={cx(
                `flex items-center justify-center transition-transform duration-300`,
                {'rotate-[45deg]': isOpen},
                {'w-[2rem] h-[2rem] translate-y-5': type === 'faqs'},
                {'w-[1.2rem] h-[1.2rem]': type !== 'faqs'},
              )}
            >
              <Icon name="Plus" viewBox="0 0 12 12" />
            </div>
          </div>
        </button>
      )}

      <m.div
        id={`accordion-${id}`}
        className={`accordion--content`}
        initial={isOpen ? 'open' : 'closed'}
        animate={isOpen ? 'open' : 'closed'}
        variants={accordionAnim}
        transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
        onAnimationComplete={(v) => setHasFocus(v === 'open')}
      >
        <div
          className="accordion--inner p-15 border-t border-[#E8E8E8] text-14"
          hidden={!isOpen && !hasFocus}
        >
          {children}
        </div>
      </m.div>
    </div>
  )
}

export default Accordion
