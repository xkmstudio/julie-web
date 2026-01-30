import React from 'react'
import NextLink from 'next/link'

import Photo from '@components/photo'
import BlockContent from '@components/block-content'
import { useIsInFrame } from '@lib/helpers'

const AuthorCard = ({ person, className = 'flex-1', onFrameLinkClick }) => {
  const isInFrame = useIsInFrame()
  const shouldHandleInFrame = isInFrame && onFrameLinkClick
  const profileHref = `/profiles/${person.slug}`
  
  const handleClick = (e) => {
    if (shouldHandleInFrame) {
      e.preventDefault()
      onFrameLinkClick(profileHref)
    }
  }
  
  const headerContent = (
    <div className="w-full flex items-center gap-10">
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
      <div className="flex flex-col gap-0">
        <div className="font-lxb">{person.title}</div>
        <div>{person.role}</div>
      </div>
    </div>
  )
  
  return (
    <div className={`${className} block rounded-[1.5rem] border border-pink p-20`}>
      {shouldHandleInFrame ? (
        <a
          href={profileHref}
          onClick={handleClick}
          className="block"
        >
          {headerContent}
        </a>
      ) : (
        <NextLink
          href={profileHref}
          className="block"
        >
          {headerContent}
        </NextLink>
      )}
      <div className="w-full text-14 mt-20">
        <BlockContent blocks={person.bio} onFrameLinkClick={onFrameLinkClick} />
      </div>
    </div>
  )
}

export default AuthorCard

