import React from 'react'
import Error from 'next/error'
import { useRouter } from 'next/router'

import { getPage } from '@data'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import { Module } from '@components/modules'

const Page = ({ data }) => {
  const router = useRouter()

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  const { site, page } = data

  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={page}>
          {page.modules?.map((module, key) => (
            <Module key={key} index={key} module={module} />
          ))}
        </Layout>
      )}
    </>
  )
} 

export async function getServerSideProps({ params, res, preview, previewData }) {
  // Set cache headers for performance while allowing dynamic content
  // Cache for 60 seconds, but allow revalidation
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  )

  const pageSlug = params.slug.join('/')
  const pageData = await getPage(pageSlug, {
    active: preview,
    token: previewData?.token,
  })

  // Return 404 if page not found
  if (!pageData || !pageData.page) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data: pageData, 
    },
  }
}

export default Page

