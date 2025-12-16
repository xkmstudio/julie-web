import React from 'react'
import Link from 'next/link'

import { getCollection, getAllDocSlugs } from '@data'

import Layout from '@components/layout'
import Photo from '@components/photo'
import Icon from '@components/icon'
import BlockContent from '@components/block-content'
import { Module } from '@components/modules'

const CollectionContent = ({ modules }) => {

  return (
    <div className="">
      <div className="w-full">
        {modules?.map((module, key) => (
          <Module index={key} key={key} module={module} />
        ))}
      </div>
    </div>
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

export default CollectionContent
