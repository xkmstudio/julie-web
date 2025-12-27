import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Accordion from '@components/accordion'
import AccordionList from '@components/accordion-list'
import { buildGradientStyle } from '@lib/helpers'
import Link from '@components/link'

const Faqs = ({ data = {} }) => {
  const { title, backgroundGradient, sections, cta } = data
  const firstSectionId =
    sections?.[0]?._key || (sections?.length > 0 ? 'section-0' : null)
  const [activeSection, setActiveSection] = useState(firstSectionId)

  const handleSectionToggle = (id, status) => {
    setActiveSection(status ? id : null)
  }

  const [triggerRef] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  // Build gradient background style if gradient is present
  const sectionStyle = backgroundGradient
    ? buildGradientStyle(backgroundGradient)
    : {}

  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <section ref={triggerRef} className="w-full md:px-25">
      <div
        className="w-full h-full md:rounded-[1.5rem] overflow-hidden"
        style={sectionStyle}
      >
        <div className="mx-auto px-15 pt-30 md:pt-60 w-full max-w-[100rem]">
          {/* Sections as Accordion Drawers */}
          <div className="flex flex-col gap-20 md:gap-30">
            {sections?.map((section, index) => {
              const sectionId = section._key || `section-${index}`
              const isOpen = sectionId === activeSection

              return (
                <Accordion
                  key={sectionId}
                  id={sectionId}
                  index={index}
                  title={section.title || `Section ${index + 1}`}
                  type="faqs"
                  isOpen={isOpen}
                  onToggle={handleSectionToggle}
                  titleClassName="text-14 md:text-18 font-plaid uppercase text-pink"
                  iconName="Chevron Down"
                  iconViewBox="0 0 22 13"
                >
                  <AccordionList
                    type="faqs"
                    items={section.drawers || []}
                    contentClassName="px-15"
                  />
                </Accordion>
              )
            })}
          </div>
        </div>
        <div className="w-full flex flex-col gap-50 justify-center mt-60 text-center px-15 md:px-25">
          <div>
            <h2 className="title-2xl">{cta?.text}</h2>
          </div>
          {cta?.link?.title && (
            <div className="w-full flex justify-center">
              <Link link={cta.link} className="btn is-large" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Faqs
