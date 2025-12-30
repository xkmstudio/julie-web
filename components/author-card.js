import React from 'react'
import NextLink from 'next/link'

import Photo from '@components/photo'
import BlockContent from '@components/block-content'

const AuthorCard = ({ person, className = 'flex-1' }) => {
  return (
    <NextLink
      href={`/profiles/${person.slug}`}
      className={`${className} block rounded-[1.5rem] border border-pink p-20`}
    >
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
    </NextLink>
  )
}

export default AuthorCard

