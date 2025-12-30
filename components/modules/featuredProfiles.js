import React, { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useInView } from 'react-intersection-observer'
import NextLink from 'next/link'

import Photo from '@components/photo'
import { useWindowSize, useIsInFrame } from '@lib/helpers'

const MOBILE_BREAKPOINT = 950

const ProfileCard = ({ profile }) => {
  return (
    <NextLink
      href={`/profiles/${profile.slug}`}
      className="group block w-full"
    >
      <div className="w-full flex flex-col gap-15">
        <div className="w-full relative rounded-[1rem] overflow-hidden pb-[100%]">
          {profile.image ? (
            <Photo
              photo={profile.image}
              width={800}
              srcSizes={[400, 600, 800, 1000]}
              sizes="(max-width: 949px) 83.333vw, 25vw"
              layout={'fill'}
              className={
                'w-full h-full object-cover absolute top-0 left-0'
              }
            />
          ) : (
            <div className="w-full h-full bg-ash/10 absolute top-0 left-0 flex items-center justify-center">
              <span className="text-ash text-14">No image</span>
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-5 text-center">
          {profile.title && (
            <h3 className="text-18 font-bold">{profile.title}</h3>
          )}
          {profile.role && (
            <div className="text-14 text-ash">{profile.role}</div>
          )}
        </div>
      </div>
    </NextLink>
  )
}

const FeaturedProfiles = ({ data = {} }) => {
  const { profiles, title } = data
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isInFrame = useIsInFrame()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const showCarousel = isClient && (isMobile || isInFrame)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    loop: true,
  })
  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (triggerInView && emblaApi && showCarousel) {
      emblaApi.reInit()
    }
  }, [triggerInView, emblaApi, showCarousel])

  if (!profiles || profiles.length === 0) return null

  return (
    <section className="w-full section-padding flex flex-col gap-30" ref={triggerRef}>
      {title && (
        <h2 className="title-2xl w-full text-center mb-20 max-w-[80rem] mx-auto">
          {title}
        </h2>
      )}
      {showCarousel ? (
        <div className="w-full">
          <div ref={emblaRef} className="">
            <div className="flex">
              {profiles.map((profile, key) => (
                <div
                  key={key}
                  className="w-[80%] min-w-[80%] ml-15"
                >
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full grid-standard gap-15 md:gap-25">
          {profiles.map((profile, key) => (
            <div
              key={key}
              className="col-span-3"
            >
              <ProfileCard profile={profile} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedProfiles
