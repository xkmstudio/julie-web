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

  // Debug: List all ALGOLIA-related env vars (for troubleshooting)
  const allAlgoliaVars = Object.keys(process.env)
    .filter(key => key.includes('ALGOLIA'))
    .map(key => `  ${key}: ${process.env[key] ? '✓ (set)' : '✗ (empty)'}`)

  if (allAlgoliaVars.length > 0) {
    console.log('Found Algolia-related environment variables:')
    allAlgoliaVars.forEach(v => console.log(v))
    console.log('')
  }

  // Validate required environment variables
  if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !algoliaAdminKey) {
    console.error('Missing required environment variables:')
    console.error('- NEXT_PUBLIC_ALGOLIA_APP_ID:', NEXT_PUBLIC_ALGOLIA_APP_ID ? '✓' : '✗')
    console.error('- ALGOLIA_ADMIN_API_KEY or ALGOLIA_WRITE_KEY:', algoliaAdminKey ? '✓' : '✗')
    console.error('')
    console.error('Note: Make sure these are set in your .env.local file in the project root')
    console.error('Expected variable names:')
    console.error('  - NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id')
    console.error('  - ALGOLIA_ADMIN_API_KEY=your_admin_key (or ALGOLIA_WRITE_KEY)')
    console.error('')
    console.error(`Looking for .env files at:`)
    console.error(`  - ${envPath}`)
    console.error(`  - ${envPathFallback}`)
    console.error('')
    console.error('Troubleshooting:')
    console.error('1. Check that ALGOLIA_ADMIN_API_KEY or ALGOLIA_WRITE_KEY exists in .env.local')
    console.error('2. The variable name must match exactly (case-sensitive)')
    console.error('3. Make sure there are no spaces around the = sign')
    console.error('4. The value should not be wrapped in quotes unless necessary')
    process.exit(1)
  }

  const projectId = SANITY_PROJECT_ID || '3gqwcxz3'
  const dataset = SANITY_PROJECT_DATASET || 'production'
  console.log(`Using Sanity project: ${projectId}`)
  console.log(`Using Sanity dataset: ${dataset}`)

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
        image{
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
        tags[]->{
          title,
          "slug": slug.current
        },
        authors[]->{
          title,
          "slug": slug.current,
          role,
          image{
            alt,
            asset->{
              _ref,
              assetId,
              mimeType,
              metadata{
                dimensions{
                  aspectRatio,
                  width,
                  height
                },
                lqip
              }
            }
          }
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

    // Debug: Check first article's image structure
    if (articles.length > 0) {
      const firstArticle = articles[0]
      console.log('\n=== First Article Image Debug ===')
      console.log('Title:', firstArticle.title)
      console.log('Has image:', !!firstArticle.image)
      if (firstArticle.image) {
        console.log('Image structure:', {
          alt: firstArticle.image.alt,
          hasAsset: !!firstArticle.image.asset,
          asset: firstArticle.image.asset,
          hasUrl: !!firstArticle.image.url,
          url: firstArticle.image.url,
          id: firstArticle.image.id,
          type: firstArticle.image.type
        })
      }
      console.log('Has gradient:', !!firstArticle.gradient)
      if (firstArticle.gradient) {
        console.log('Gradient structure:', {
          alt: firstArticle.gradient.alt,
          hasAsset: !!firstArticle.gradient.asset,
          asset: firstArticle.gradient.asset,
          hasUrl: !!firstArticle.gradient.url,
          url: firstArticle.gradient.url
        })
      }
      console.log('================================\n')
    }

    // Prepare documents for Algolia
    const algoliaDocuments = articles.map((article: any) => {
      // Ensure content is within Algolia's size limits (10KB max per record)
      // We'll be more conservative and limit to 8000 characters to leave room for other fields
      const content = article.content ? article.content.slice(0, 8000) : ''
      const excerpt = article.excerpt ? article.excerpt.slice(0, 2000) : ''
      const summary = article.summary ? article.summary.slice(0, 2000) : ''

      // Transform tags
      const tags = (article.tags || []).map((tag: any) => ({
        title: tag.title || '',
        slug: typeof tag.slug === 'string' ? tag.slug : tag.slug?.current || tag.slug || '',
      }))

      // Transform authors
      const authors = (article.authors || []).map((author: any) => ({
        title: author.title || '',
        slug: typeof author.slug === 'string' ? author.slug : author.slug?.current || author.slug || '',
        role: author.role || '',
        image: author.image?.asset?._ref || null,
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
        
        // Store as object with all metadata
        if (imageUrl) {
          image = {
            url: imageUrl,
            alt: article.image.alt || '',
            lqip: article.image.lqip || null,
            width: article.image.width || null,
            height: article.image.height || null,
            aspectRatio: article.image.aspectRatio || null,
          }
        }
      }

      // Transform gradient - store as object with url, alt, lqip, etc.
      let gradient = null
      if (article.gradient) {
        let gradientUrl = article.gradient.url || null
        
        // If URL is missing, try to build from asset reference
        if (!gradientUrl) {
          const gradientAssetRef = typeof article.gradient.asset === 'string'
            ? article.gradient.asset
            : (article.gradient.asset?._ref || article.gradient.asset || null)
          
          if (gradientAssetRef) {
            try {
              gradientUrl = buildImageUrlFromRef(gradientAssetRef)
            } catch (error) {
              console.warn(`Could not build gradient URL from asset ref for "${article.title}":`, error)
            }
          }
        }
        
        // Store as object with all metadata
        if (gradientUrl) {
          gradient = {
            url: gradientUrl,
            alt: article.gradient.alt || '',
            lqip: article.gradient.lqip || null,
            width: article.gradient.width || null,
            height: article.gradient.height || null,
            aspectRatio: article.gradient.aspectRatio || null,
          }
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

    // Debug: Check a few documents before syncing
    console.log('\n=== Sample Documents Before Sync ===')
    const sampleDoc = algoliaDocuments.find(doc => doc.slug === 'article-5') || algoliaDocuments[0]
    console.log('Sample document:', JSON.stringify({
      objectID: sampleDoc.objectID,
      title: sampleDoc.title,
      image: sampleDoc.image,
      gradient: sampleDoc.gradient,
    }, null, 2))
    console.log('=====================================\n')

    // Clear existing documents in the index to ensure we're overwriting, not appending
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

    console.log('Initial sync to Algolia completed successfully')
    console.log(`Synced ${algoliaDocuments.length} documents to index: ${ALGOLIA_INDEX_NAME}`)
    
    // Verify: Check what was actually stored
    console.log('\n=== Verifying Stored Data ===')
    try {
      const verifyDoc = await algoliaClient.getObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: sampleDoc.objectID,
      })
      console.log('Retrieved document from Algolia:', JSON.stringify({
        objectID: verifyDoc.objectID,
        title: verifyDoc.title,
        image: verifyDoc.image,
        gradient: verifyDoc.gradient,
      }, null, 2))
    } catch (error) {
      console.error('Could not verify stored data:', error)
    }
    console.log('================================\n')
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
