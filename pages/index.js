import React, { useEffect, useRef, useState, useCallback } from 'react'
import Error from 'next/error'

import { getStaticPage, queries } from '@data'

import Layout from '@components/layout'
import { Module } from '@components/modules'


const Home = ({ data }) => {
  const { site, page } = data

  const { content } = page

  return (
    <Layout site={site} page={page}>
      {content.modules?.map((module, key) => (
        <Module key={key} index={key} module={module} />
      ))}
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
    // Production: cache HTML briefly at the edge for faster repeat requests
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
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
    *[_type == "home"][0]{
      'content': home->{
        'modules': modules[]{
          defined(_ref) => { ...@->content[0] {
            ${queries.modules}
          }},
          !defined(_ref) => {
            ${queries.modules},
          }
        },
        seo,
      },
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
