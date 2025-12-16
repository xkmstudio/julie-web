import React from 'react'
import NextLink from 'next/link'
import cx from 'classnames'

import Link from '@components/link'
import Video from '@components/video-lazy'
import VideoDuration from './video-duration'
import Icon from '@components/icon'

const IndexTutorials = ({ data = {} }) => {
  const { title, subtitle, products, cta } = data

  if (!products || products.length === 0) return null

  return (
    <section className={`mx-auto px-15 uppercase has-border`}>
      <div className="grid-standard bg-cement title-normal">
        <div className="col-span-1 p-10">Tutorial</div>
        <div className="col-span-2 py-10">Name</div>
        <div className="col-span-2 py-10">Type</div>
        <div className="col-span-4 py-10">Configuration</div>
        <div className="col-span-3 py-10">Duration</div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <div className="">
          {products.map((product, index) => {
            if (!product.tutorial) return null

            return (
              <NextLink
                href={`/products/${product.slug}`}
                key={product._id || index}
                className="group tutorial-item grid-standard items-end pt-10 border-b border-cement"
              >
                <div className="col-span-2">
                  <div className="w-full">
                    {product.tutorial?.video && (
                      <Video
                        src={product.tutorial.video}
                        posterUrl={product.tutorial.posterUrl}
                        posterAspect={product.tutorial.posterAspect}
                        layout="intrinsic"
                        className="w-full"
                        autoplay={true}
                        controls={false}
                      />
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex gap-10 items-end relative">
                  <div
                    className={cx(
                      'scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.16, 1, 0.3, 1)] absolute bottom-0 left-0 w-[calc(100vw)] h-[3rem] bg-white mix-blend-difference z-3',
                    )}
                  ></div>
                  <div className="text-11 w-30 h-30 flex items-center justify-center bg-black text-white relative z-4">
                    {index < 9 ? `0${index + 1}` : index + 1}
                  </div>
                  <div className="h-[3rem] flex items-center">
                    {product.title}
                  </div>
                </div>
                <div className="col-span-2 h-[3rem] flex items-center">
                  {product.productType}
                </div>
                <div className="col-span-3 h-[3rem] flex items-center">
                  <div className="">{product.subtitle}</div>
                </div>
                <div className="col-span-3 h-[3rem] flex items-center gap-5 justify-between pr-10">
                  {product.tutorial?.sections && (
                    <span className="text-sm text-gray-600">
                      {product.tutorial.sections.length}{' '}
                      {product.tutorial.sections.length === 1
                        ? 'step'
                        : 'steps'}
                    </span>
                  )}
                  <div className="flex items-center gap-20">
                      <span>
                        {product.tutorial?.video && (
                          <VideoDuration
                            videoUrl={product.tutorial.video}
                            className=""
                          />
                        )}
                      </span>
                      <div className='w-6 h-6 flex items-center justify-center'>
                        <Icon name="Play Video" viewBox="0 0 372 429" />
                      </div>
                  </div>
                </div>
                {/* <div className="col-span-2"></div> */}
              </NextLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default IndexTutorials
