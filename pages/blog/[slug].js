import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { getArticle } from '@data'
import { useWindowSize, useIsInFrame } from '@lib/helpers'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import PageContent from '@components/page-content'
import ArticleCard from '@components/related-card'
import AuthorCard from '@components/author-card'
import ProductCarousel from '@components/product-carousel'

const MOBILE_BREAKPOINT = 850

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

export async function getServerSideProps({ params, res, preview, previewData }) {
  // Set cache headers based on environment
  // For staging/preview: no cache to ensure fresh content
  // For production: cache for performance
  const isProduction = 
    process.env.NODE_ENV === 'production' && 
    process.env.CONTEXT === 'production'
  
  if (isProduction) {
    // Production: cache for 60 seconds, allow stale-while-revalidate
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
  } else {
    // Staging/Preview: no cache to ensure fresh content
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    )
  }

  const eventData = await getArticle(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  // Return 404 if article not found
  if (!eventData || !eventData.page) {
    return {
      notFound: true,
    }
  }

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

export default Article
