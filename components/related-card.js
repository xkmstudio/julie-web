import React from 'react'
import NextLink from 'next/link'
import cx from 'classnames'

import Photo from '@components/photo'

const RelatedCard = ({ item, className }) => {
  return (
    <>
      <div className={cx('flex flex-col gap-15 md:gap-20', className || 'w-full md:w-1/2')}>
        <div className="w-full flex flex-col">
          <div className="w-full pb-[100%] relative rounded-[1rem] overflow-hidden">
            <Photo
              photo={item?.image}
              width={2400}
              srcSizes={[600, 1000, 1200, 1600]}
              sizes="100%"
              layout={'fill'}
              className={'absolute left-0 top-0 object-cover h-full w-full'}
            />
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
                <NextLink
                  className="underline font-lb"
                  href={`/profiles/${item.authors[0].slug}`}
                >
                  {item.authors[0].title}
                </NextLink>
              </div>
            </div>
            <div className="flex text-pink justify-center items-center gap-10 tag-role">
              {item.authors[0].role}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RelatedCard
