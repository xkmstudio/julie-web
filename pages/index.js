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

export async function getStaticProps({ preview, previewData }) {
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
