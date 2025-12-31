import React, { useState } from 'react'

import { AnimatePresence, m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import Accordion from '@components/accordion'
import BlockContent from '@components/block-content'

const AccordionList = ({ items, type, openFirst, contentClassName }) => {
  const [activeAccordion, setActiveAccordion] = useState(null)

  const onToggle = (id, status) => {
    setActiveAccordion(status ? id : null)
  }

  const [scrollRef, inView] = useInView({ threshold: 0, triggerOnce: true })

  return (
    <div ref={scrollRef} className={`accordion-group flex flex-col${type === 'product' ? ' gap-10' : ''}`}>
      {items.map((accordion, key) => {
        return (
          <m.div
            key={key}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: inView ? 0 : 10, opacity: inView ? 1 : 0 }}
            transition={{
              duration: 1.5,
              delay: .1 * key,
              ease: [0.16, 1, 0.3, 1],
            }}
            className=''
          >
            <Accordion
              key={key}
              type={type}
              index={key}
              id={accordion._key}
              isOpen={accordion._key === activeAccordion}
              onToggle={onToggle}
              title={accordion.title}
            >
              {contentClassName ? (
                <div className={contentClassName}>
                  <BlockContent
                    className="w-full max-w-[66rem]"
                    blocks={accordion.content}
                  />
                </div>
              ) : (
                <BlockContent
                  className="w-full max-w-[66rem]"
                  blocks={accordion.content}
                />
              )}
            </Accordion>
          </m.div>
        )
      })}
    </div>
  )
}

export default AccordionList
