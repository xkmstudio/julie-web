// studio/scripts/algolia-product-sync.ts

import { env } from 'node:process'
import { algoliasearch } from 'algoliasearch'
import { createClient } from '@sanity/client'
import { buildImageUrl, parseImageAssetId, isImageAssetId } from '@sanity/asset-utils'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in project root
const envPath = path.resolve(__dirname, '../../.env.local')
const envPathFallback = path.resolve(__dirname, '../../.env')
const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
  dotenv.config({ path: envPathFallback })
}

// Get environment variables
const NEXT_PUBLIC_ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ''
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || ''
const ALGOLIA_WRITE_KEY = process.env.ALGOLIA_WRITE_KEY || ''
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || ''
const SANITY_PROJECT_DATASET = process.env.SANITY_PROJECT_DATASET || ''

// Use ALGOLIA_WRITE_KEY as fallback if ALGOLIA_ADMIN_API_KEY is not set
const algoliaAdminKey = ALGOLIA_ADMIN_API_KEY || ALGOLIA_WRITE_KEY

// Index name for products
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX_NAME || 'products'

// Build image URL from asset reference
function buildImageUrlFromRef(assetRef: string | null | undefined): string | null {
  if (!assetRef || !isImageAssetId(assetRef)) return null
  const parts = parseImageAssetId(assetRef)
  
  return buildImageUrl({
    ...parts,
    projectId: SANITY_PROJECT_ID || '3gqwcxz3',
    dataset: SANITY_PROJECT_DATASET || 'production',
  })
}

// Create Sanity client
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID || '3gqwcxz3',
  dataset: SANITY_PROJECT_DATASET || 'production',
  useCdn: false,
  apiVersion: '2021-03-25',
})

async function initialSync() {
  console.log('Starting initial product sync to Algolia...')

  // Validate required environment variables
  if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !algoliaAdminKey) {
    console.error('Missing required environment variables:')
    console.error('- NEXT_PUBLIC_ALGOLIA_APP_ID:', NEXT_PUBLIC_ALGOLIA_APP_ID ? '✓' : '✗')
    console.error('- ALGOLIA_ADMIN_API_KEY or ALGOLIA_WRITE_KEY:', algoliaAdminKey ? '✓' : '✗')
    process.exit(1)
  }

  const projectId = SANITY_PROJECT_ID || '3gqwcxz3'
  const dataset = SANITY_PROJECT_DATASET || 'production'
  console.log(`Using Sanity project: ${projectId}`)
  console.log(`Using Sanity dataset: ${dataset}`)
  console.log(`Using Algolia index: ${ALGOLIA_INDEX_NAME}`)

  const algoliaClient = algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, algoliaAdminKey)

  try {
    // Fetch all product documents from Sanity
    const products = await sanityClient.fetch(`
      *[_type == "product" && !(_id in path("drafts.**")) && wasDeleted != true && isDraft != true] | order(_updatedAt desc) {
        _id,
        _type,
        title,
        subtitle,
        productType,
        productTitle,
        "slug": slug.current,
        "productID": productID,
        price,
        comparePrice,
        inStock,
        lowStock,
        preOrder,
        limitedEdition,
        soldOut,
        heroImage{
          alt,
          "asset": image.asset._ref,
          "url": image.asset->url,
          "id": image.asset->assetId,
          "type": image.asset->mimeType,
          "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
          "lqip": image.asset->metadata.lqip,
          "width": image.asset->metadata.dimensions.width,
          "height": image.asset->metadata.dimensions.height
        },
        productThumbnail{
          _type,
          _type == 'asset' => {
            alt,
            "asset": image.asset._ref,
            "url": image.asset->url,
            "id": image.asset->assetId,
            "type": image.asset->mimeType,
            "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
            "lqip": image.asset->metadata.lqip,
            "width": image.asset->metadata.dimensions.width,
            "height": image.asset->metadata.dimensions.height
          }
        },
        "description": pt::text(description),
        options[]{
          name,
          position,
          values[]
        },
        _createdAt,
        _updatedAt
      }
    `)

    console.log(`Found ${products.length} products to sync`)

    if (products.length === 0) {
      console.log('No products found to sync')
      return
    }

    // Prepare documents for Algolia
    const algoliaDocuments = products.map((product: any) => {
      // Transform hero image
      let heroImage = null
      if (product.heroImage) {
        let imageUrl = product.heroImage.url || null
        if (!imageUrl && product.heroImage.asset) {
          imageUrl = buildImageUrlFromRef(product.heroImage.asset)
        }
        if (imageUrl) {
          heroImage = {
            url: imageUrl,
            alt: product.heroImage.alt || '',
            lqip: product.heroImage.lqip || null,
            width: product.heroImage.width || null,
            height: product.heroImage.height || null,
            aspectRatio: product.heroImage.aspectRatio || null,
          }
        }
      }

      // Transform product thumbnail
      let thumbnail = null
      if (product.productThumbnail?._type === 'asset' && product.productThumbnail) {
        let imageUrl = product.productThumbnail.url || null
        if (!imageUrl && product.productThumbnail.asset) {
          imageUrl = buildImageUrlFromRef(product.productThumbnail.asset)
        }
        if (imageUrl) {
          thumbnail = {
            url: imageUrl,
            alt: product.productThumbnail.alt || '',
            lqip: product.productThumbnail.lqip || null,
            width: product.productThumbnail.width || null,
            height: product.productThumbnail.height || null,
            aspectRatio: product.productThumbnail.aspectRatio || null,
          }
        }
      }

      const document = {
        objectID: product._id,
        slug: product.slug || '',
        productID: product.productID || '',
        title: product.title || '',
        subtitle: product.subtitle || '',
        productType: product.productType || '',
        productTitle: product.productTitle || '',
        price: product.price || null,
        comparePrice: product.comparePrice || null,
        inStock: product.inStock || false,
        lowStock: product.lowStock || false,
        preOrder: product.preOrder || false,
        limitedEdition: product.limitedEdition || false,
        soldOut: product.soldOut || false,
        heroImage,
        thumbnail,
        description: product.description || '',
        options: product.options || [],
        _createdAt: product._createdAt,
        _updatedAt: product._updatedAt,
      }

      return document
    })

    // Clear existing documents in the index
    console.log('Clearing existing documents from Algolia index...')
    await algoliaClient.clearObjects({
      indexName: ALGOLIA_INDEX_NAME,
    })

    // Save all documents to Algolia
    console.log('Uploading documents to Algolia...')
    await algoliaClient.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: algoliaDocuments,
    })

    console.log('Initial product sync to Algolia completed successfully')
    console.log(`Synced ${algoliaDocuments.length} products to index: ${ALGOLIA_INDEX_NAME}`)
  } catch (error) {
    console.error('Error during initial product sync to Algolia:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  initialSync()
    .then(() => {
      console.log('Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

export default initialSync

