import React from 'react'
import NextLink from 'next/link'
import cx from 'classnames'

import Photo from '@components/photo'
import Gradient from '@components/gradient'
import { useIsInFrame } from '@lib/helpers'

const RelatedCard = ({ item, className, onFrameLinkClick, articleHref }) => {
  const isInFrame = useIsInFrame()
  const shouldHandleInFrame = isInFrame && onFrameLinkClick
  const profileHref = item.authors?.[0]?.slug ? `/profiles/${item.authors[0].slug}` : null
  
  const cardContent = (
    <div className="flex flex-col gap-15 md:gap-20">
      <div className="w-full flex flex-col">
        <div className="w-full pb-[100%] relative rounded-[1rem] overflow-hidden">
          {(() => {
            // Check if gradient is valid (has colorStops with at least 2 items)
            const hasValidGradient = item?.gradient && 
              item.gradient.colorStops && 
              Array.isArray(item.gradient.colorStops) && 
              item.gradient.colorStops.length >= 2;
            
            // If useGradient is true or no image, prioritize gradient
            if ((item?.useGradient || !item?.image) && hasValidGradient) {
              return (
                <div className="w-full h-full absolute top-0 left-0">
                  <Gradient gradient={item.gradient} />
                </div>
              );
            }
            
            // Otherwise, use image if available
            if (item?.image) {
              return (
                <Photo
                  photo={item.image}
                  width={2400}
                  srcSizes={[600, 1000, 1200, 1600]}
                  sizes="100%"
                  layout={'fill'}
                  className={'absolute left-0 top-0 object-cover h-full w-full'}
                />
              );
            }
            
            // Fallback to gradient if available (even if useGradient not set)
            if (hasValidGradient) {
              return (
                <div className="w-full h-full absolute top-0 left-0">
                  <Gradient gradient={item.gradient} />
                </div>
              );
            }
            
            // Final fallback to grey placeholder
            return (
              <div className="w-full h-full bg-ash/10 absolute top-0 left-0" />
            );
          })()}
          {item.tags && (
            <div className="tag is-card absolute top-10 left-10">
              {item.tags?.title}
            </div>
          )}
        </div>
      </div>
      <div className="md:flex-1 flex flex-col items-center md:items-start justify-between">
        <div className="flex flex-col gap-10">
          <div className="text-24 md:text-40 font-lxb text-center md:text-left leading-[1.05]">
            {item.title}
          </div>
        </div>
      </div>
      {item.authors?.length > 0 && (
        <div className='flex flex-col md:flex-row items-center flex-wrap gap-10'>
          <div className="flex justify-center items-center gap-3">
            <div>by</div>
            <div>
              {articleHref ? (
                // When card is already a link, use span to avoid nested <a> tags
                <span className="underline font-lb">
                  {item.authors[0].title}
                </span>
              ) : shouldHandleInFrame && profileHref ? (
                <a
                  className="underline font-lb"
                  href={profileHref}
                  onClick={(e) => {
                    e.preventDefault()
                    onFrameLinkClick(profileHref)
                  }}
                >
                  {item.authors[0].title}
                </a>
              ) : (
                <NextLink
                  className="underline font-lb"
                  href={profileHref || '#'}
                >
                  {item.authors[0].title}
                </NextLink>
              )}
            </div>
          </div>
          <div className="flex text-pink justify-center items-center gap-10 tag-role">
            {item.authors[0].role}
          </div>
        </div>
      )}
    </div>
  )
  
  // If articleHref is provided and we're in frame, wrap in link
  if (articleHref && shouldHandleInFrame) {
    return (
      <a
        href={articleHref}
        onClick={(e) => {
          e.preventDefault()
          onFrameLinkClick(articleHref)
        }}
        className={cx(className || 'w-full md:w-1/2', 'block')}
      >
        {cardContent}
      </a>
    )
  }
  
  // If articleHref is provided but not in frame, use NextLink
  if (articleHref && !shouldHandleInFrame) {
    return (
      <NextLink href={articleHref} className={cx(className || 'w-full md:w-1/2', 'block')}>
        {cardContent}
      </NextLink>
    )
  }
  
  // Just return content without link wrapper
  return (
    <div className={className || 'w-full md:w-1/2'}>
      {cardContent}
    </div>
  )
}

export default RelatedCard
