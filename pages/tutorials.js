import React, { useEffect, useRef, useState, useCallback } from 'react'
import Error from 'next/error'
import cx from 'classnames'

import { getStaticPage, queries } from '@data'

import Layout from '@components/layout'
import BlockContent from '@components/block-content'
import Link from '@components/link'
import VideoPlayer from '@components/video-player'

const Home = ({ data }) => {
  const { site, page } = data

  const { title, description, cta, videoTutorials } = page

  const [currentTutorial, setCurrentTutorial] = useState(0)
  const totalTutorials = videoTutorials?.length || 0

  const scrollPrev = useCallback(() => {
    if (!totalTutorials) return
    setCurrentTutorial((prev) => (prev - 1 + totalTutorials) % totalTutorials)
  }, [totalTutorials])

  const scrollNext = useCallback(() => {
    if (!totalTutorials) return
    setCurrentTutorial((prev) => (prev + 1) % totalTutorials)
  }, [totalTutorials])

  return (
    <Layout site={site} page={page}>
      <section
        className="mx-auto relative px-10 md:px-15 mt-100"
        style={{ paddingTop: '0px' }}
      >
        <div className="grid-standard">
          <div className="col-span-12 md:col-span-8">
            <div className="bg-cement px-10 md:px-15 h-[3rem] text-left flex items-center justify-start">
              <h1 className="title-normal">{title}</h1>
            </div>

            <div className="px-10 md:px-15 mt-10 md:mt-15">
              <BlockContent blocks={description} />
            </div>
          </div>
          {cta && (
            <div className="hidden md:blockcol-span-4">
              <Link className="btn is-dark w-full" link={cta} hasArrow={true} />
            </div>
          )}
        </div>
        <div className="mt-90 md:mt-120">
          <div className="hidden md:flex">
            {videoTutorials?.map((tutorial, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setCurrentTutorial(index)}
                  className={cx(
                    `tutorial-item transition-colors duration-300 flex-1 flex items-center justify-center h-30 title-normal`,
                    currentTutorial === index
                      ? 'text-white bg-black'
                      : 'text-black bg-white hover:bg-cement'
                  )}
                >
                  {tutorial.title}
                </button>
              )
            })}
          </div>
          {totalTutorials > 0 && (
            <div className="col-span-4 md:col-span-6 flex md:hidden items-center justify-between gap-10 bg-black text-white">
              <button
                onClick={scrollPrev}
                className="h-[3rem] w-[3rem] flex items-center justify-center flex-shrink-0"
                aria-label="Previous slide"
              >
                {`<`}
              </button>
              <span className="text-sm text-center">
                {videoTutorials[currentTutorial]?.title}
              </span>
              <button
                onClick={scrollNext}
                className="h-[3rem] w-[3rem] flex items-center justify-center flex-shrink-0"
                aria-label="Next slide"
              >
                {`>`}
              </button>
            </div>
          )}
          <div>
            {videoTutorials?.map((product, index) => {
              if (!product.tutorial || index !== currentTutorial) return null

              const { tutorial } = product

              return (
                <div key={product._id || index} className="tutorial-item">
                  <VideoPlayer
                    src={tutorial.video}
                    poster={tutorial.poster}
                    posterUrl={tutorial.posterUrl}
                    sections={tutorial.sections || []}
                    layout={'intrinsic'}
                    className={'w-full'}
                    autoplay={!tutorial.autoplayDisabled}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps({ preview, previewData }) {
  const pageData = await getStaticPage(
    `
    *[_type == "tutorialsPage"][0]{
      title,
      description,
      cta[0]{${queries.link}},
      videoTutorials[]->{
        title,
        "slug": slug.current,
        subtitle,
        productType,
        tutorial{
            ${queries.videoTutorialContent}
        }
      },
      seo,
    }
  `,
    {
      active: preview,
      token: previewData?.token,
    }
  )

  return {
    props: {
      data: pageData,
    },
  }
}

export default Home
