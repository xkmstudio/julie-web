import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Accordion from '@components/accordion'
import AccordionList from '@components/accordion-list'
import { buildGradientStyle } from '@lib/helpers'
import Link from '@components/link'
import BlockContent from '@components/block-content'
import Icon from '@components/icon'
import EmaWidget from '@components/emaWidget'

const Faqs = ({ data = {} }) => {
  const { title, hero, backgroundGradient, sections, cta } = data
  const hasHeroContent = hero && (hero.title || hero.subtitle)
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
        className="w-full h-full md:rounded-[1.5rem]"
        style={sectionStyle}
      >
        {hasHeroContent && (
          <div
            className={`w-full flex flex-col items-center relative z-3 py-20 justify-center`}
          >
            <div
              className={`flex flex-col gap-20 w-full max-w-[78rem] px-20 text-center${hero.mobileTag
                ? ' relative md:absolute z-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
                : ' relative z-2 pt-[calc(var(--headerHeight)+2.5rem)] md:pt-[calc(var(--headerHeight)+2rem)] pb-[4rem]'
                }`}
            >
              <div className="flex flex-col gap-15 md:gap-25">
                {hero.title && (
                  <h1 className="title-2xl">
                    <BlockContent blocks={hero.title} />
                  </h1>
                )}
                {hero.subtitle && (
                  <div className="text-14 md:text-16">
                    <BlockContent blocks={hero.subtitle} />
                  </div>
                )}
              </div>

            </div>
            {hero.mobileTag && (
              <div className="relative z-2 flex items-center justify-center md:hidden">
                <div className="tag-glass">
                  <div className="text-14 text-center flex-shrink-0">{hero.mobileTag}</div>
                  <div className="w-[1.5rem] flex items-center justify-center flex-shrink-0">
                    <Icon name="Arrow Curve" viewBox="0 0 19 14" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mx-auto px-15 pt-30 md:pt-0 w-full max-w-[100rem]">
          {/* Sections as Accordion Drawers */}
          <div className="flex flex-col gap-20 md:gap-30">
            {sections?.map((section, index) => {
              const sectionId = section._key || `section-${index}`
              const isOpen = sectionId === activeSection

              return (
                <div className='w-full rounded-[1.5rem] overflow-hidden' key={sectionId}>
                  <Accordion
                    id={sectionId}
                    index={index}
                    title={section.title || `Section ${index + 1}`}
                    type="faqs"
                    isOpen={isOpen}
                    onToggle={handleSectionToggle}
                    titleClassName="text-14 md:text-18 font-plaid uppercase text-pink faqs"
                    iconName="Chevron Down"
                    iconViewBox="0 0 22 13"
                  >
                    <AccordionList
                      type="faqs"
                      items={section.drawers || []}
                      contentClassName=""
                    />
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-full flex flex-col gap-50 justify-center mt-60 text-center px-15 md:px-25">
          <div>
            <h2 className="title-2xl">{cta?.text}</h2>
          </div>
          {hero.hasEma && (
            <div className="mt-20">
              <EmaWidget />
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

export default Faqs
