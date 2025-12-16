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
          <div className="fixed w-screen h-screen z-9 bg-white left-0 top-0 flex flex-col gap-20 items-center justify-center">
            <div className="font-voy text-80 md:text-100 uppercase p-30 shadow-primaryInner bg-acid">
              Error
            </div>
            <div className=" font-mono text-12">
              We couldn't find the page you're looking for.
            </div>
            <Link href="/" className="bg-offwhite border border-fog px-20 py-10 uppercase">
              Go home
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
