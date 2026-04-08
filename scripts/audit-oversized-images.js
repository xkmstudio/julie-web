#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { createClient } = require('@sanity/client')

const SIZE_LIMIT_BYTES = 100 * 1024

async function run() {
  if (!process.env.SANITY_PROJECT_ID) {
    throw new Error('Missing SANITY_PROJECT_ID')
  }

  const client = createClient({
    dataset: process.env.SANITY_PROJECT_DATASET || 'production',
    projectId: process.env.SANITY_PROJECT_ID,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2021-03-25',
  })

  const oversizedAssets = await client.fetch(
    `*[_type == "sanity.imageAsset" && size > $minSize] | order(size desc) {
      _id,
      originalFilename,
      url,
      size,
      mimeType,
      metadata {
        dimensions { width, height }
      },
      "referenceCount": count(*[references(^._id)])
    }`,
    { minSize: SIZE_LIMIT_BYTES }
  )

  const total = oversizedAssets.length
  const totalBytes = oversizedAssets.reduce((sum, asset) => sum + (asset.size || 0), 0)
  const referenced = oversizedAssets.filter((asset) => (asset.referenceCount || 0) > 0)
  const topReferenced = [...referenced]
    .sort((a, b) => (b.referenceCount || 0) - (a.referenceCount || 0))
    .slice(0, 50)

  console.log('--- Oversized Image Audit ---')
  console.log(`Threshold: ${(SIZE_LIMIT_BYTES / 1024).toFixed(0)}KB`)
  console.log(`Oversized assets: ${total}`)
  console.log(`Oversized assets with references: ${referenced.length}`)
  console.log(`Total oversized bytes: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`)
  console.log('')

  console.log('Top 50 by reference count:')
  topReferenced.forEach((asset, idx) => {
    const sizeKb = ((asset.size || 0) / 1024).toFixed(1)
    const dims = asset?.metadata?.dimensions
      ? `${asset.metadata.dimensions.width}x${asset.metadata.dimensions.height}`
      : 'unknown'
    console.log(
      `${idx + 1}. refs=${asset.referenceCount} size=${sizeKb}KB dims=${dims} file=${asset.originalFilename || asset._id}`
    )
    console.log(`   ${asset.url}`)
  })
}

run().catch((error) => {
  console.error('Failed to audit oversized images.')
  console.error(error.message || error)
  process.exit(1)
})
