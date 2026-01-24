import React, { useRef, useEffect, useState } from 'react'
import Error from 'next/error'
import { getStaticPage, queries } from '@data'
import NextLink from 'next/link'

import Layout from '@components/layout'
import Hero from '@components/modules/hero'
import { Module } from '@components/modules'

import FocusTrap from 'focus-trap-react'
import { AnimatePresence, m } from 'framer-motion'
import CollectionContent from '@components/shop-collectionContent'

const Shop = ({ data }) => {
  const { site, page } = data
  if (!page) {
    return (
      <Error
        title={`"Home Page" is not set in Sanity, or the page data is missing`}
        statusCode="Data Error"
      />
    )
  }
  return (
    <Layout site={site} page={page}>
      <CollectionContent page={page.content} />
      <div className="fixed top-0 left-0 h-full w-full z-[99991] bg-[rgba(0,0,0,.75)] backdrop-blur-frame flex items-center justify-center p-15 md:p-30">
        <m.div
          initial="hide"
          animate="show"
          exit="hide"
          variants={{
            show: {
              y: '0rem',
              opacity: 1,
            },
            hide: {
              y: '2rem',
              opacity: 0,
            },
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-2 w-full max-w-[65rem] bg-glass backdrop-blur-frame px-15 py-30 md:p-50 rounded-[.5rem]"
        >
          
        </m.div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ res, preview, previewData }) {
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

  const pageData = await getStaticPage(
    `
    *[_type == "shopHome"][0]{
        title,
        seo,
        "content": collection->{
            sections[]{
                "products": products[]->{
                    title,
                    subtitle,
                    'slug': slug.current,
                    'thumbnailFeature': thumbnailFeature{${queries.assetMeta}},
                    'thumbnailSecondary': thumbnailSecondary{${queries.assetMeta}},
                    useDescriptionThumbnail,
                    description[]{${queries.ptContent}},
                    descriptionThumbnail[]{${queries.ptContent}}
                },
            },
        }
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

export default Shop

{
  /* product redirect */
}
