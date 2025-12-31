import React from 'react'
import NextLink from 'next/link'

import Photo from '@components/photo'
import BlockContent from '@components/block-content'
import { useIsInFrame } from '@lib/helpers'

const AuthorCard = ({ person, className = 'flex-1', onFrameLinkClick }) => {
  const isInFrame = useIsInFrame()
  const shouldHandleInFrame = isInFrame && onFrameLinkClick
  const profileHref = `/profiles/${person.slug}`
  
  const cardContent = (
    <>
      <div className="w-full flex gap-10">
        <div className="w-50 h-50 rounded-full overflow-hidden relative">
          <Photo
            photo={person.image}
            width={600}
            srcSizes={[800, 1200, 1600, 2400]}
            sizes="100%"
            layout={'fill'}
            className={'object-cover h-full w-full'}
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="">{person.title}</div>
          <div>{person.role}</div>
        </div>
      </div>
      <div className="w-full text-14 mt-20">
        <BlockContent blocks={person.bio} />
      </div>
    </>
  )
  
  if (shouldHandleInFrame) {
    return (
      <a
        href={profileHref}
        onClick={(e) => {
          e.preventDefault()
          onFrameLinkClick(profileHref)
        }}
        className={`${className} block rounded-[1.5rem] border border-pink p-20`}
      >
        {cardContent}
      </a>
    )
  }
  
  return (
    <NextLink
      href={profileHref}
      className={`${className} block rounded-[1.5rem] border border-pink p-20`}
    >
      {cardContent}
    </NextLink>
  )
}

export default AuthorCard

