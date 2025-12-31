import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { getArticle, getAllDocSlugs } from '@data'
import { useWindowSize, useIsInFrame } from '@lib/helpers'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import PageContent from '@components/page-content'
import ArticleCard from '@components/related-card'
import AuthorCard from '@components/author-card'
import ProductCarousel from '@components/product-carousel'

const MOBILE_BREAKPOINT = 950

const Article = ({ data, sanityConfig }) => {
  const router = useRouter()
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isInFrame = useIsInFrame()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  const { site, page } = data

  const {
    title,
    content,
    image,
    date,
    related,
    summary,
    excerpt,
    tag,
    authors,
    reviewers,
    modules,
    useGradient,
    gradient,
  } = page
  
  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={page}>
          <PageContent
            page={page}
            type="article"
            sanityConfig={sanityConfig}
            isInFrame={false}
          />
          {/* Author and reviewer section */}
          {(authors?.length > 0 || reviewers?.length > 0) && (
            <div className={`w-full section-padding ${isClient && (isMobile || isInFrame) ? 'overflow-hidden' : ''}`}>
              {isClient && (isMobile || isInFrame) ? (
                <ProductCarousel
                  items={[
                    ...(authors?.map((author) => ({
                      ...author,
                      type: 'author',
                    })) || []),
                    ...(reviewers?.map((reviewer) => ({
                      ...reviewer,
                      type: 'reviewer',
                    })) || []),
                  ]}
                  renderSlide={(person, key) => (
                    <AuthorCard key={key} person={person} className="w-full" />
                  )}
                  slideClassName="w-[83.333%] min-w-[83.333%] ml-15"
                  enabled={isClient && isMobile}
                />
              ) : (
                <div className="w-full flex gap-15 md:gap-25">
                  {[
                    ...(authors?.map((author) => ({
                      ...author,
                      type: 'author',
                    })) || []),
                    ...(reviewers?.map((reviewer) => ({
                      ...reviewer,
                      type: 'reviewer',
                    })) || []),
                  ].map((person, key) => {
                    return (
                      <AuthorCard key={key} person={person} />
                    )
                  })}
                </div>
              )}
            </div>
          )}
          <div className="w-full flex flex-col items-center gap-35 my-90 section-padding">
            <div className="title-2xl">still have questions?</div>
            <button className="btn" href="/contact">
              Ask Julie
            </button>
          </div>
          {related && (
            <div className={`mt-60 md:mt-100 flex flex-col items-center gap-30 md:gap-60 pb-60 md:pb-120 section-padding ${isClient && (isMobile || isInFrame) ? 'overflow-hidden' : ''}`}>
              {isClient && (isMobile || isInFrame) ? (
                <ProductCarousel
                  items={related}
                  renderSlide={(item, key) => (
                    <ArticleCard key={key} item={item} />
                  )}
                  slideClassName="w-[83.333%] min-w-[83.333%] ml-15"
                  enabled={isClient && isMobile}
                />
              ) : (
                <div className="flex flex-col md:flex-row gap-40 md:gap-20 w-full">
                  {related?.map((item, key) => {
                    return (
                      <React.Fragment key={key}>
                        <ArticleCard item={item} />
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </Layout>
      )}
    </>
  )
}

export async function getStaticProps({ params, preview, previewData }) {
  const eventData = await getArticle(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  return {
    props: {
      data: eventData,
      sanityConfig: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_PROJECT_DATASET,
      },
    },
  }
}

export async function getStaticPaths() {
  const allArticles = await getAllDocSlugs('article')

  return {
    paths:
      allArticles?.map((article) => {
        return {
          params: {
            slug: article.slug,
            id: article._id,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default Article
