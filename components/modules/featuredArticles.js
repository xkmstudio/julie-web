import React, { useState, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useInView } from 'react-intersection-observer'
import NextLink from 'next/link'
import cx from 'classnames'

import Photo from '@components/photo'
import Media from '@components/media'
import Icon from '@components/icon'
import BlockContent from '@components/block-content'
import Gradient from '@components/gradient'

const Jewels = () => {
  return (
    <>
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute left-[5%] top-[-1rem] w-[1.5rem] z-2 jewel-float-1"
      />
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute left-[18%] top-[8%] w-[1.5rem] z-2 jewel-float-2"
      />
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute right-[-1rem] top-[13%] w-[1.5rem] z-2 jewel-float-3"
      />
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute right-[4%] bottom-[45%] w-[1.5rem] z-2 jewel-float-4"
      />
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute right-[calc(5%+3rem)] bottom-[40%] w-[1.5rem] z-2 jewel-float-5"
      />
      <img
        src="/icons/jewel.png"
        alt="Jewel"
        className="absolute left-[2rem] bottom-[-1rem] w-[1.5rem] z-2 jewel-float-6"
      />
    </>
  )
}

const FeaturedArticles = ({ data = {} }) => {
  const { articles, useList, featuredCard, title } = data

  const CardType = featuredCard?.link ? 'a' : 'div';

  // List view (gradient style)
  if (useList) {
    return (
      <section className="w-full section-padding">
        {articles && articles.length > 0 && (
          <div className="w-full hidden md:flex gap-15 md:gap-25">
            <div className="w-2/3">
              {title && (
                <h2 className="text-16 font-plaid uppercase text-pink mb-20">
                  {title}
                </h2>
              )}
            </div>
            <div className="flex-1 text-[#666666]">
              {featuredCard?.title && (
                <h2 className="text-16 font-plaid uppercase mb-20">
                  {featuredCard.title}
                </h2>
              )}
            </div>
          </div>
        )}
        <div className="w-full flex flex-col-reverse md:flex-row gap-40 md:gap-25">
          {articles && articles.length > 0 && (
            <div
              className={cx(`w-full mx-auto md:border-t-2 border-ash`, {
                'w-full md:w-2/3': featuredCard?.media?.content,
                'w-full': !featuredCard?.media?.content,
              })}
            >
              {title && (
                <div className="md:hidden w-full text-center mb-15 md:mb-0">
                  {title && (
                    <h2 className="text-16 font-plaid uppercase text-pink">
                      {title}
                    </h2>
                  )}
                </div>
              )}
              {articles && articles.length > 0 && (
                <div className="w-full flex flex-col gap-0 border-t-2 md:border-0 border-ash">
                  {articles?.map((article, key) => (
                    <NextLink
                      key={key}
                      href={`/blog/${article.slug}`}
                      className="group w-full flex flex-col-reverse md:flex-row items-center md:items-end justify-between text-center md:text-left py-20 border-b-2 border-ash hover:bg-gray-50 transition-colors gap-20"
                    >
                      <div className="flex-1 flex flex-col-reverse md:flex-col gap-15 md:gap-10">
                        <div className="font-lb">
                          by {article.authors?.[0]?.title || 'Unknown'}
                        </div>
                        <h3 className="title-lg font-bold">{article.title}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-15">
                        <div className="hidden md:block text-ash transition-colors duration-300 group-hover:text-black">
                          <Icon
                            name="Arrow Out"
                            viewBox="0 0 18 18"
                            className="w-16 h-16"
                          />
                        </div>
                        {article.tags?.[0] && (
                          <div className="tag">{article.tags[0].title}</div>
                        )}
                      </div>
                    </NextLink>
                  ))}
                </div>
              )}
            </div>
          )}
          {featuredCard?.media?.content && (
            <CardType href={featuredCard?.link} target={featuredCard?.link ? '_blank' : undefined} rel={featuredCard?.link ? 'noopener noreferrer' : undefined} className="w-full md:flex-1">
              <div className="w-full h-full bg-[#FF3BAB] rounded-[1.5rem] flex flex-col md:flex-row">
                {(!articles || articles.length === 0) && (
                  <div className="w-full md:w-[66.6667%] flex p-15 md:p-20 md:pr-0 relative">
                    <div className="w-full relative min-h-[calc(100vw-6rem)] md:min-h-[60rem]">
                      <div className="w-full relative rounded-[1rem] overflow-hidden h-full">
                        <Media
                          media={featuredCard.media.content}
                          width={1200}
                          srcSizes={[800, 1000, 1200, 1600]}
                          sizes="100%"
                          layout={'fill'}
                          className={
                            'w-full h-full object-cover absolute top-0 left-0'
                          }
                        />
                      </div>
                      <Jewels />
                    </div>
                  </div>
                )}
                <div
                  className={cx(`w-full flex flex-col h-full gap-10 flex-1`, {
                    'p-20 md:p-40 py-20 md:py-60 justify-between':
                      !articles || articles.length === 0,
                    'p-15 md:p-20 justify-between':
                      articles && articles.length > 0,
                  })}
                >
                  <div className="w-full relative">
                    <Photo
                      photo={featuredCard.logo}
                      width={1200}
                      srcSizes={[800, 1000, 1200, 1600]}
                      sizes="(max-width: 768px) 83.333vw, 30vw"
                      layout={'intrinsic'}
                      className={'w-full'}
                    />
                  </div>
                  {articles && articles.length > 0 && (
                    <div className="relative w-full md:flex-1 flex justify-end items-end h-[calc(100vw-6rem)] md:h-auto">
                      <div className="w-full relative rounded-[1rem] h-full overflow-hidden">
                        <Media
                          media={featuredCard.media.content}
                          width={1200}
                          srcSizes={[800, 1000, 1200, 1600]}
                          sizes="100%"
                          layout={'fill'}
                          className={
                            'w-full h-full object-cover absolute top-0 left-0'
                          }
                        />
                      </div>
                      <Jewels />
                    </div>
                  )}
                  <div className="w-full text-center flex flex-col gap-15 py-10">
                    {featuredCard.title && (
                      <div className="text-18 md:text-24 font-bold">
                        <BlockContent blocks={featuredCard.description} />
                      </div>
                    )}
                    {featuredCard.subtitle && (
                      <div className="text-14 md:text-16 font-plaid uppercase">
                        <BlockContent blocks={featuredCard.subtitle} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardType>
          )}
        </div>
      </section>
    )
  }

  // Carousel view
  return <FeaturedArticlesCarousel articles={articles} />
}

const FeaturedArticlesCarousel = ({ articles }) => {
  const [target, setTarget] = useState(undefined)
  const scrollRef = useRef(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      skipSnaps: false,
      loop: true,
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis: 'x',
        target,
      }),
    ]
  )
  const [triggerRef, triggerInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  // Set wheel target once after mount
  useEffect(() => {
    setTarget(scrollRef.current || undefined)
  }, [])

  useEffect(() => {
    if (triggerInView && emblaApi) {
      emblaApi.reInit()
    }
  }, [triggerInView, emblaApi])

  return (
    <section
      className="w-full pl-15 md:pl-25 py-20 overflow-hidden"
      ref={triggerRef}
    >
      <div ref={scrollRef} className="overflow-hidden">
        <div ref={emblaRef} className="">
          <div className="flex">
            {articles.map((article, key) => {
              return (
                <div
                  key={key}
                  className="article-card-container flex-[0_0_83.333%] md:flex-[0_0_40%] min-w-0 ml-15 md:ml-25"
                >
                  <NextLink
                    href={`/blog/${article.slug}`}
                    className="block w-full"
                  >
                    <div className="article-card w-full pb-[133.3333%] md:pb-[66.6667%] relative rounded-[1rem] overflow-hidden">
                      {article.gradient ? (
                        <div className="w-full h-full absolute top-0 left-0">
                          <Gradient gradient={article.gradient} />
                        </div>
                      ) : article.image ? (
                        <Photo
                          photo={article.image}
                          width={1200}
                          srcSizes={[800, 1000, 1200, 1600]}
                          sizes="(max-width: 768px) 83.333vw, 30vw"
                          layout={'fill'}
                          className={
                            'w-full h-full object-cover absolute top-0 left-0'
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-ash/10 absolute top-0 left-0" />
                      )}
                      {article.tags?.[0] && (
                        <div className="tag is-card absolute top-10 left-10">
                          {article.tags[0].title}
                        </div>
                      )}
                    </div>
                    <div className="mt-10 p-10 flex flex-col items-center md:items-start text-center md:text-left gap-10">
                      <h2 className="w-full title-2xs">{article.title}</h2>
                      {article.authors?.length > 0 && (
                        <div className="flex flex-col md:flex-row items-center flex-wrap gap-10 text-center md:text-left">
                          <div className="flex justify-center items-center gap-3">
                            <div>by</div>
                            <div>
                              <span className="underline font-lb">
                                {article.authors[0].title}
                              </span>
                            </div>
                          </div>
                          {article.authors[0].role && (
                            <div className="flex text-pink justify-center items-center gap-10 tag-role">
                              {article.authors[0].role}
                            </div>
                          )}
                        </div>
                      )}
                      {article.subtitle && (
                        <div className="text-14 text-ash line-clamp-2">
                          {article.subtitle}
                        </div>
                      )}
                    </div>
                  </NextLink>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedArticles
