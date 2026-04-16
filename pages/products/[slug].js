import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import useSWR from 'swr'

import { getProduct } from '@data'

import { useParams, usePrevious } from '@lib/helpers'
import { buildPageSchemas } from '@lib/schema'

import { useSiteContext } from '@lib/context'

import NotFoundPage from '@pages/404'
import Layout from '@components/layout'
import { Module } from '@components/modules'
import ProductHero from '@components/modules/productHero'

// setup our inventory fetcher
const fetchInventory = (id) =>
  axios
    .get(`${window.location.origin}/api/shopify/product-inventory?id=${id}`)
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching inventory:', error)
      throw error // Rethrow the error to handle it in the calling code
    })

const Product = ({ data }) => {
  const router = useRouter()
  const { isPageTransition } = useSiteContext()

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  // extract our data
  const { site, page } = data

  // set our Product state
  const [product, setProduct] = useState(page.product)

  // find the default variant: first that has quantity (is in stock), otherwise first variant
  const variantsToUse = product?.variants ?? page.product.variants ?? []
  const defaultVariant =
    variantsToUse.find((v) => (v.quantity ?? 0) > 0 || v.inStock) ??
    variantsToUse[0]
  const defaultVariantID = defaultVariant?.id ?? page.product.variants?.[0]?.id

  // set up our variant URL params
  const [currentParams, setCurrentParams] = useParams([
    {
      name: 'variant',
      value: defaultVariantID,
    },
  ])
  const previousParams = usePrevious(currentParams)

  // determine which params set to use
  const activeParams =
    isPageTransition && previousParams ? previousParams : currentParams

  // find our activeVariantID ID
  const paramVariantID = activeParams.find(
    (filter) => filter.name === 'variant'
  ).value
  const foundVariant = page.product.variants?.find(
    (v) => v.id == paramVariantID
  )
  const activeVariantID = foundVariant ? paramVariantID : defaultVariantID

  // handle variant change
  const updateVariant = useCallback(
    (id) => {
      const isValidVariant = page.product.variants.find((v) => v.id == id)
      setCurrentParams([
        ...activeParams,
        {
          name: 'variant',
          value: isValidVariant ? `${id}` : defaultVariantID,
        },
      ])
    },
    [activeParams]
  )

  const { data: productInventory } = useSWR(
    [page.product.id],
    (id) => fetchInventory(id),
    { errorRetryCount: 3 }
  )

  useEffect(() => {
    if (page.product && productInventory) {
      setProduct({
        ...page.product,
        inStock: productInventory.inStock,
        lowStock: productInventory.lowStock,
        variants: [
          ...page.product.variants.map((v) => {
            const newInventory = productInventory.variants?.find(
              (nv) => nv.id === v.id
            )
            return newInventory ? { ...v, ...newInventory } : v
          }),
        ],
      })
    }
  }, [page.product, productInventory])

  const schema = buildPageSchemas({
    modules: page.modules,
    site,
    currentPath: router.asPath,
    product,
    activeVariantID,
  })

  return (
    <>
      {!router.isFallback && (
        <Layout
          site={site}
          page={page}
          schema={schema}
        >
          <ProductHero
            product={product}
            modules={page.modules}
            onVariantChange={updateVariant}
            activeVariant={product.variants.find(
              (v) => v.id == activeVariantID
            )}
          />
          {page.modules?.map((module, key) => (
            <Module
              key={key}
              index={key}
              module={module}
              product={product}
              activeVariant={product.variants.find(
                (v) => v.id == activeVariantID
              )}
              onVariantChange={updateVariant}
            />
          ))}
        </Layout>
      )}
    </>
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

  const productData = await getProduct(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  // Return 404 if product not found
  if (!productData || !productData.page) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data: productData,
    },
  }
}

export default Product
