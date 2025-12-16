import React from 'react'
import Link from 'next/link'
// import Error from 'next/error'
import { useRouter } from 'next/router'

import { getStaticPage, queries } from '@data'

import Layout from '@components/layout'
import { Module } from '@components/modules'

const Error = ({ data }) => {
  const router = useRouter()

  const { site, page } = data

//   if (!page) {
//     return (
//       <Error
//         title={`"Error Page (404)" is not set in Sanity, or the page data is missing`}
//         statusCode="Data Error"
//       />
//     )
//   }

  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={{ title: null }}>
          <div className="fixed w-screen h-screen z-9 bg-white left-0 top-0 flex flex-col items-center justify-center">
            <div className="title-lg text-80 md:text-100 uppercase p-30 shadow-primaryInner bg-acid">
              Error
            </div>
            <div className="mt-10 font-mono text-12">
              We couldn't find the page you're looking for.
            </div>
            <Link href="/" className="btn-nav mt-10">
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

export default Error
