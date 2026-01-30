// studio/scripts/algolia-initial-sync.ts

import { env } from 'node:process'
import { algoliasearch } from 'algoliasearch'
import { createClient } from '@sanity/client'
import { buildImageUrl, parseImageAssetId, isImageAssetId } from '@sanity/asset-utils'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in project root
// Try .env.local first, then .env
const envPath = path.resolve(__dirname, '../../.env.local')
const envPathFallback = path.resolve(__dirname, '../../.env')
const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
  dotenv.config({ path: envPathFallback })
}

// Get environment variables (dotenv loads them into process.env)
// Note: When running via `sanity exec`, dotenv may inject vars differently
const NEXT_PUBLIC_ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ''
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || ''
const ALGOLIA_WRITE_KEY = process.env.ALGOLIA_WRITE_KEY || ''
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || ''
const SANITY_PROJECT_DATASET = process.env.SANITY_PROJECT_DATASET || ''

// Use ALGOLIA_WRITE_KEY as fallback if ALGOLIA_ADMIN_API_KEY is not set
const algoliaAdminKey = ALGOLIA_ADMIN_API_KEY || ALGOLIA_WRITE_KEY

// Debug: Show what Algolia-related vars we found (without exposing values)
if (process.env.DEBUG) {
  console.log('Debug - Algolia env vars found:')
  console.log(`  NEXT_PUBLIC_ALGOLIA_APP_ID: ${NEXT_PUBLIC_ALGOLIA_APP_ID ? '✓ (set)' : '✗ (not set)'}`)
  console.log(`  ALGOLIA_ADMIN_API_KEY: ${ALGOLIA_ADMIN_API_KEY ? '✓ (set)' : '✗ (not set)'}`)
  console.log(`  ALGOLIA_WRITE_KEY: ${ALGOLIA_WRITE_KEY ? '✓ (set)' : '✗ (not set)'}`)
  console.log(`  Final algoliaAdminKey: ${algoliaAdminKey ? '✓ (set)' : '✗ (not set)'}`)
}

// Index name for articles
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'

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
// Fallback to hardcoded values from studio config if env vars not set
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID || '3gqwcxz3',
  dataset: SANITY_PROJECT_DATASET || 'production',
  useCdn: false, // Always use fresh data for sync
  apiVersion: '2021-03-25',
})

async function initialSync() {
  console.log('Starting initial sync to Algolia...')

  // Validate required environment variables
  if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !algoliaAdminKey) {
    console.error('Missing required environment variables:')
    console.error('- NEXT_PUBLIC_ALGOLIA_APP_ID:', NEXT_PUBLIC_ALGOLIA_APP_ID ? '✓' : '✗')
    console.error('- ALGOLIA_ADMIN_API_KEY or ALGOLIA_WRITE_KEY:', algoliaAdminKey ? '✓' : '✗')
    process.exit(1)
  }

  const projectId = SANITY_PROJECT_ID || '3gqwcxz3'
  const dataset = SANITY_PROJECT_DATASET || 'production'

  const algoliaClient = algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, algoliaAdminKey)

  try {
    // Fetch all article documents from Sanity
    const articles = await sanityClient.fetch(`
      *[_type == "article" && defined(date) && !(_id in path("drafts.**"))] | order(date desc) {
        _id,
        _type,
        title,
        subtitle,
        "slug": slug.current,
        date,
        useGradient,
        gradient{
          _type,
          type,
          direction,
          customAngle,
          colorStops[]{
            _key,
            position,
            color{
              _type,
              hex,
              alpha,
              rgb{
                r, g, b, a
              }
            }
          }
        },
        image{
          alt,
          "asset": image.asset._ref,
          "url": image.asset->url,
          "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
          "width": image.asset->metadata.dimensions.width,
          "height": image.asset->metadata.dimensions.height
        },
        tags[]->{
          title,
          "slug": slug.current
        },
        authors[]->{
          title,
          "slug": slug.current,
          role
        },
        "content": pt::text(content),
        "excerpt": pt::text(excerpt),
        "summary": pt::text(summary),
        _createdAt,
        _updatedAt
      }
    `)

    console.log(`Found ${articles.length} articles to sync`)

    if (articles.length === 0) {
      console.log('No articles found to sync')
      return
    }

    // Prepare documents for Algolia
    const algoliaDocuments = articles.map((article: any) => {
      // Ensure content is within Algolia's size limits (10KB max per record)
      // Be conservative - limit text fields to leave room for other fields
      const content = article.content ? article.content.slice(0, 5000) : ''
      const excerpt = article.excerpt ? article.excerpt.slice(0, 1000) : ''
      const summary = article.summary ? article.summary.slice(0, 1000) : ''

      // Transform tags
      const tags = (article.tags || []).map((tag: any) => ({
        title: tag.title || '',
        slug: typeof tag.slug === 'string' ? tag.slug : tag.slug?.current || tag.slug || '',
      }))

      // Transform authors (minimal data for search - no images)
      const authors = (article.authors || []).map((author: any) => ({
        title: author.title || '',
        slug: typeof author.slug === 'string' ? author.slug : author.slug?.current || author.slug || '',
        role: author.role || '',
      }))

      // Transform image - store as object with url, alt, lqip, etc.
      let image = null
      if (article.image) {
        // Get URL directly from query, or build from asset ref if needed
        let imageUrl = article.image.url || null
        
        // If URL is missing, try to build from asset reference
        if (!imageUrl) {
          const imageAssetRef = typeof article.image.asset === 'string' 
            ? article.image.asset 
            : (article.image.asset?._ref || article.image.asset || null)
          
          if (imageAssetRef) {
            try {
              imageUrl = buildImageUrlFromRef(imageAssetRef)
            } catch (error) {
              console.warn(`Could not build image URL from asset ref for "${article.title}":`, error)
            }
          }
        }
        
        // Store as object with metadata (no lqip - too large for Algolia)
        if (imageUrl) {
          image = {
            url: imageUrl,
            alt: article.image.alt || '',
            width: article.image.width || null,
            height: article.image.height || null,
            aspectRatio: article.image.aspectRatio || null,
          }
        }
      }

      // Transform gradient - store colorStops for CSS gradient rendering
      let gradient = null
      if (article.gradient && article.gradient.colorStops && article.gradient.colorStops.length >= 2) {
        gradient = {
          _type: article.gradient._type || 'gradient',
          type: article.gradient.type || 'linear',
          direction: article.gradient.direction || 'to bottom',
          customAngle: article.gradient.customAngle || null,
          colorStops: article.gradient.colorStops.map((stop: any) => ({
            _key: stop._key,
            position: stop.position ?? 0,
            color: stop.color ? {
              hex: stop.color.hex || '#000000',
              alpha: stop.color.alpha ?? 1,
              rgb: stop.color.rgb ? {
                r: stop.color.rgb.r || 0,
                g: stop.color.rgb.g || 0,
                b: stop.color.rgb.b || 0,
                a: stop.color.rgb.a ?? 1,
              } : null,
            } : null,
          })),
        }
      }

      const document = {
        objectID: article._id,
        slug: article.slug || '',
        title: article.title?.slice(0, 500) || '',
        subtitle: article.subtitle?.slice(0, 500) || '',
        date: article.date || article._createdAt,
        useGradient: article.useGradient || false,
        tags,
        authors,
        image,
        gradient,
        _content: content,
        _excerpt: excerpt,
        _summary: summary,
        _createdAt: article._createdAt,
        _updatedAt: article._updatedAt,
      }

      // Check document size and warn if it's getting close to the limit
      const documentSize = JSON.stringify(document).length
      if (documentSize > 9000) {
        console.warn(`Document ${article._id} is ${documentSize} bytes (close to 10KB limit)`)
      }

      return document
    })

    // Clear existing documents and upload new ones
    console.log('Clearing existing documents from Algolia index...')
    await algoliaClient.clearObjects({
      indexName: ALGOLIA_INDEX_NAME,
    })

    console.log('Uploading documents to Algolia...')
    await algoliaClient.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: algoliaDocuments,
    })

    console.log(`✓ Synced ${algoliaDocuments.length} articles to index: ${ALGOLIA_INDEX_NAME}`)
  } catch (error) {
    console.error('Error during initial sync to Algolia:', error)
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

initialSync()
