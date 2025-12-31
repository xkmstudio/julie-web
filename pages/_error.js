import React from 'react'
import Link from 'next/link'
import Error from 'next/error'
import { useRouter } from 'next/router'

import { getStaticPage, queries } from '@data'

import Layout from '@components/layout'
import { Module } from '@components/modules'

const NotFoundPage = ({ data }) => {
  const router = useRouter()

  const { site, page } = data

  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={{ title: null }}>
          <div className="w-full section-padding max-w-[80rem] mx-auto flex flex-col gap-20 items-center justify-center text-center pt-160">
            <div className="font-plaid text-16 md:text-18 uppercase tracking-[-.02em] leading-100">
              Error
            </div>
            <h1 className="title-2xl">
              We couldn't find the page you're looking for.
            </h1>
            <Link href="/" className="btn">
              Back to home
            </Link>
          </div>
        </Layout>
      )}
    </>
  )
}

export async function getStaticProps({ preview, previewData }) {
  const pageData = await getStaticPage(
    `
    *[_type == "error"] | order(_updatedAt desc)[0]{
      title,
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

export default NotFoundPage
