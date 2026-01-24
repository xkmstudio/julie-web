import React, { useState, useEffect, useRef, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useInView } from 'react-intersection-observer'
import AccordionList from '@components/accordion-list'
import { buildGradientStyle, useWindowSize, useIsInFrame } from '@lib/helpers'
import Link from '@components/link'

const MOBILE_BREAKPOINT = 850

const ProductFaqs = ({ data = {} }) => {
  const { title, backgroundGradient, sections, cta } = data
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isInFrame = useIsInFrame()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const sectionRefs = useRef([])

  // Embla carousel for mobile button scrolling
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    skipSnaps: false,
    loop: false,
  })

  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isMobile && triggerInView && emblaApi) {
      emblaApi.reInit()
    }
  }, [emblaApi, isMobile, triggerInView])

  // Initialize section refs array
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections?.length || 0)
  }, [sections])

  // Scroll to section on mobile when button is clicked
  const scrollToSection = useCallback((index) => {
    // Use a small delay to ensure DOM is updated
    setTimeout(() => {
      if (sectionRefs.current[index]) {
        sectionRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 100)
  }, [])

  // Handle section button click
  const handleSectionClick = useCallback((index) => {
    setActiveSectionIndex(index)
    if (isMobile && emblaApi) {
      // Scroll carousel to selected button
      emblaApi.scrollTo(index)
      // Scroll page to section
      // scrollToSection(index)
    }
  }, [isMobile, emblaApi, scrollToSection])

  // Build gradient background style if gradient is present
  const sectionStyle = backgroundGradient
    ? buildGradientStyle(backgroundGradient)
    : {}

  if (!sections || sections.length === 0) {
    return null
  }

  const activeSection = sections[activeSectionIndex]
  const hasMultipleSections = sections.length > 1

  console.log('cta', cta);


  return (
    <section
      ref={triggerRef}
      className="w-full md:px-25"
    >
      <div className="w-full h-full md:rounded-[1.5rem] overflow-hidden" style={sectionStyle}>
        <div className="mx-auto px-10 md:px-15 pb-20 pt-60 w-full max-w-[100rem]">
          {/* Section Button Toggles - Only show if multiple sections */}
          {hasMultipleSections && (
            <div className="w-full mb-60">
              {(isMobile || isInFrame) && isClient ? (
                // Mobile: Horizontal carousel
                <div className="overflow-hidden -mx-10 md:mx-0">
                  <div ref={emblaRef} className="overflow-visible">
                    <div className="flex gap-10 px-10 md:px-0">
                      {sections.map((section, index) => {
                        const isActive = index === activeSectionIndex
                        return (
                          <button
                            key={index}
                            onClick={() => handleSectionClick(index)}
                            className={`flex-shrink-0 px-20 py-10 rounded-full text-14 md:text-16 font-lb lowercase whitespace-nowrap transition-colors duration-300 ${isActive
                              ? 'bg-pink text-white'
                              : 'bg-cement text-black'
                              }`}
                          >
                            {section.title || `Section ${index + 1}`}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop: Flex layout
                <div className="flex flex-wrap gap-10">
                  {sections.map((section, index) => {
                    const isActive = index === activeSectionIndex
                    return (
                      <button
                        key={index}
                        onClick={() => handleSectionClick(index)}
                        className={`px-20 py-10 rounded-full text-14 md:text-16 font-lb lowercase whitespace-nowrap transition-colors duration-300 ${isActive
                          ? 'bg-pink text-white'
                          : 'bg-cement text-black'
                          }`}
                      >
                        {section.title || `Section ${index + 1}`}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Section Content */}
          {activeSection && (
            <div
              ref={(el) => {
                sectionRefs.current[activeSectionIndex] = el
              }}
              className="w-full flex flex-col gap-30 scroll-mt-20"
            >
              {activeSection.drawers && activeSection.drawers.length > 0 && (
                <AccordionList type="faqs" items={activeSection.drawers} />
              )}
            </div>
          )}
        </div>

      </div>
      {(cta?.title || cta?.link?.title) && (
        <div className="w-full flex flex-col gap-50 justify-center mt-60 text-center px-15 md:px-25">
          <div>
            <h2 className="title-2xl">{cta?.title}</h2>
          </div>
          {cta?.link?.title && (
            <div className="w-full flex justify-center">
              <Link link={cta.link} className="btn is-large" />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default ProductFaqs
