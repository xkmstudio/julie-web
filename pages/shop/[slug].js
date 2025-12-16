import React from 'react'
import Link from 'next/link'

import { getCollection, getAllDocSlugs } from '@data'

import Layout from '@components/layout'
import Photo from '@components/photo'
import Icon from '@components/icon'
import BlockContent from '@components/block-content'
import Media from '@components/media'
import CollectionContent from '@components/shop-collectionContent'

const CollectionPage = ({ data }) => {
  const { site, page } = data

  const { title, hero, modules } = page

  return (
    <Layout site={site} page={page}>
      <div className="w-full h-[60rem] relative">
        <Media
          media={hero?.content}
          width={1600}
          srcSizes={[800, 1000, 1200, 1600]}
          sizes="100%"
          layout={'fill'}
          className={'absolute top-0 left-0 h-full w-full object-cover'}
        />
        <div className="absolute left-0 top-0 w-full h-full">
          <div className="absolute left-0 bottom-0 w-full grid-standard">
            <h1 className="col-span-6 bg-white text-black mix-blend-difference p-10 text-center">
              {title}
            </h1>
          </div>
        </div>
      </div>
      <CollectionContent modules={modules} />
    </Layout>
  )
}

export async function getStaticProps({ params, preview, previewData }) {
  const collectionData = await getCollection(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  return {
    props: {
      data: collectionData,
    },
  }
}

export async function getStaticPaths() {
  const allCollections = await getAllDocSlugs('collection')

  return {
    paths:
      allCollections?.map((collection) => {
        return {
          params: {
            slug: collection.slug,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default CollectionPage
