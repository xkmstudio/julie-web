import React from 'react'
import Link from 'next/link'

import { getCollection } from '@data'

import Layout from '@components/layout'
import Photo from '@components/photo'
import Icon from '@components/icon'
import BlockContent from '@components/block-content'
import Media from '@components/media'
import CollectionContent from '@components/shop-collectionContent'
import ProductCard from '@components/product/product-card'
import ProductCardAlternate from '@components/product/product-card-alternate'

const CollectionPage = ({ data }) => {
  const { site, page } = data

  const { title, hero, modules, products, type } = page

  if (!products) return null

  const isAlternative = type === 'alternative'
  const CardComponent = isAlternative ? ProductCardAlternate : ProductCard
  const gridClass = isAlternative ? 'section-padding pt-25 mb-90 gap-30 grid grid-cols-1 md:grid-cols-3' : 'section-padding w-full flex flex-col md:flex-row gap-15 md:gap-25'
  const cardClass = isAlternative ? '' : 'w-full md:w-1/2'

  return (
    <Layout site={site} page={page}>
      <div
        className={`${
          !hero
            ? ' mt-[calc(var(--headerHeight)+2.5rem)] md:mt-[calc(var(--headerHeight)+2rem)]'
            : ''
        }`}
      >
        {hero && (
          <div className="w-full h-[100vw] md:h-[60rem] relative">
            <Media
              media={hero?.content}
              width={1600}
              srcSizes={[800, 1000, 1200, 1600]}
              sizes="100%"
              layout={'fill'}
              className={'absolute top-0 left-0 h-full w-full object-cover'}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-white">
              <h1 className="title-2xl w-full max-w-[78rem] mx-auto text-center">
                {title}
              </h1>
            </div>
          </div>
        )}
        {products && (
          <div className={gridClass}>
            {products?.map((product, index) => (
              <CardComponent className={cardClass} key={index} product={product} />
            ))}
          </div>
        )}
        <CollectionContent modules={modules} />
      </div>
    </Layout>
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

  const collectionData = await getCollection(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  // Return 404 if collection not found
  if (!collectionData || !collectionData.page) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data: collectionData,
    },
  }
}

export default CollectionPage
