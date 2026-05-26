import React from 'react'

import Media from '@components/media'
import Link from '@components/link'

const MediaFeature = ({ data = {} }) => {
  const { media, title, link, layout = 'overlay', imageAsLink } = data

  if (!media) return null

  const isOverlay = layout !== 'standard'
  const useImageAsLink = imageAsLink && link

  const renderMedia = (props) => (
    <Media
      media={media?.content}
      width={1600}
      srcSizes={[800, 1000, 1200, 1600]}
      sizes="100%"
      {...props}
    />
  )

  const renderLinkedMedia = (props, linkClassName) => {
    const mediaElement = renderMedia(props)

    if (!useImageAsLink) return mediaElement

    return (
      <Link link={link} className={linkClassName}>
        {mediaElement}
      </Link>
    )
  }

  return (
    <section className="mx-auto relative section-padding">
      {!isOverlay && (title || (link && !useImageAsLink)) && (
        <div className="w-full flex justify-between items-end mb-20 pr-15 md:pr-20">
          {title && <h2 className="title-xl">{title}</h2>}
          {link && !useImageAsLink && <Link className="btn" link={link} />}
        </div>
      )}

      {isOverlay ? (
        <div className="w-full pb-[150%] md:pb-[50%] relative rounded-[1.5rem] overflow-hidden flex items-center justify-center">
          {renderLinkedMedia(
            {
              layout: 'fill',
              className: 'w-full h-full object-cover absolute top-0 left-0',
            },
            'block absolute inset-0 w-full h-full'
          )}

          <div className="absolute w-full top-1/2 px-15 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-15 md:gap-25 text-white pointer-events-none">
            {title && (
              <h2 className="w-full max-w-[80rem] mx-auto title-2xl text-center">
                {title}
              </h2>
            )}

            {link && !useImageAsLink && (
              <Link className="btn pointer-events-auto" link={link} />
            )}
          </div>
        </div>
      ) : (
        <div className="w-full rounded-[1.5rem] overflow-hidden">
          {renderLinkedMedia(
            {
              layout: 'intrinsic',
              className: 'w-full',
            },
            'block w-full'
          )}
        </div>
      )}
    </section>
  )
}

export default MediaFeature
