import React from 'react'
import { useRouter } from 'next/router'

import { getArticle } from '@data'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import PageContent from '@components/page-content'

const Article = ({ data, sanityConfig }) => {
  const router = useRouter()

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  const { site, page } = data
  
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
