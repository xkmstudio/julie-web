import React, { useState } from 'react'

import Accordion from '@components/accordion'
import BlockContent from '@components/block-content'

const AccordionList = ({ items, type }) => {
  const [activeAccordion, setActiveAccordion] = useState(null)

  const onToggle = (id, status) => {
    setActiveAccordion(status ? id : null)
  }  

  return (
    <div className="accordion-group flex flex-col">
      {items.map((accordion, key) => {
        return (
          <Accordion
            key={key}
            index={key}
            type={type}
            id={accordion.title}
            isOpen={accordion.title === activeAccordion}
            onToggle={onToggle}
            title={accordion.title}
          >
            <BlockContent blocks={accordion.content} />
          </Accordion>
        )
      })}
    </div>
  )
}

export default AccordionList
