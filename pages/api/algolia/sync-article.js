import { createClient } from '@sanity/client'
import { algoliasearch } from 'algoliasearch'
import { buildImageUrl, parseImageAssetId, isImageAssetId } from '@sanity/asset-utils'

// Initialize Sanity client
const sanity = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
})

// Initialize Algolia client (lazy initialization)
// In Algolia v5, methods are called directly on the client with indexName parameter
function getAlgoliaClient() {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    throw new Error('Algolia credentials are missing')
  }

  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_API_KEY
  )
}

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'

// Build image URL from asset reference
function buildImageUrlFromRef(assetRef) {
  if (!assetRef || !isImageAssetId(assetRef)) return null
  const parts = parseImageAssetId(assetRef)
  
  return buildImageUrl({
    ...parts,
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_PROJECT_DATASET,
  })
}

// Transform Sanity article to Algolia record
function transformArticleToAlgolia(article) {
  return {
    objectID: article._id, // Algolia requires objectID
    slug: article.slug?.current || article.slug,
    title: article.title || '',
    subtitle: article.subtitle || '',
    date: article.date || article._createdAt,
    useGradient: article.useGradient || false,
    // Transform tags
    tags: (article.tags || []).map((tag) => ({
      title: tag.title || tag,
      slug: tag.slug?.current || tag.slug || tag,
    })),
    // Transform authors (minimal data - no images to save space)
    authors: (article.authors || []).map((author) => ({
      title: author.title || '',
      slug: author.slug?.current || author.slug || '',
      role: author.role || '',
    })),
    // Transform image - store as object (no lqip - too large)
    image: (() => {
      if (!article.image) return null
      const url = article.image.url || (article.image.asset ? buildImageUrlFromRef(
        typeof article.image.asset === 'string' 
          ? article.image.asset 
          : article.image.asset?._ref || article.image.asset
      ) : null)
      if (!url) return null
      return {
        url,
        alt: article.image.alt || '',
        width: article.image.width || null,
        height: article.image.height || null,
        aspectRatio: article.image.aspectRatio || null,
      }
    })(),
    // Transform gradient - store colorStops for CSS gradient rendering
    gradient: article.gradient && article.gradient.colorStops && article.gradient.colorStops.length >= 2
      ? {
          _type: article.gradient._type || 'gradient',
          type: article.gradient.type || 'linear',
          direction: article.gradient.direction || 'to bottom',
          customAngle: article.gradient.customAngle || null,
          colorStops: (article.gradient.colorStops || []).map((stop) => ({
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
      : null,
    // Include content for search (plain text from portable text)
    _content: extractTextFromPortableText(article.content || []),
    _excerpt: extractTextFromPortableText(article.excerpt || []),
    _summary: extractTextFromPortableText(article.summary || []),
  }
}

// Extract plain text from portable text for search indexing
function extractTextFromPortableText(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block) => {
      if (block._type === 'block' && block.children) {
        return block.children.map((child) => child.text || '').join('')
      }
      return ''
    })
    .join(' ')
    .trim()
}

// Fetch full article data from Sanity
async function fetchArticleFromSanity(articleId) {
  const query = `
    *[_type == "article" && _id == $id][0]{
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
      content[],
      excerpt[],
      summary[]
    }
  `

  return await sanity.fetch(query, { id: articleId })
}

export default async function handler(req, res) {
  // Allow GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Algolia article sync API',
      endpoints: {
        POST: 'Sync single article (webhook)',
        PUT: 'Sync all articles (bulk)',
        DELETE: 'Delete article from index',
      },
    })
  }

  // Validate environment variables
  const missingVars = []
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) missingVars.push('NEXT_PUBLIC_ALGOLIA_APP_ID')
  if (!process.env.ALGOLIA_ADMIN_API_KEY) missingVars.push('ALGOLIA_ADMIN_API_KEY')
  if (!process.env.SANITY_PROJECT_ID) missingVars.push('SANITY_PROJECT_ID')
  if (!process.env.SANITY_PROJECT_DATASET) missingVars.push('SANITY_PROJECT_DATASET')
  if (!process.env.SANITY_API_TOKEN) missingVars.push('SANITY_API_TOKEN')

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars)
    return res.status(500).json({
      error: 'Missing required environment variables',
      missing: missingVars,
      required: [
        'NEXT_PUBLIC_ALGOLIA_APP_ID',
        'ALGOLIA_ADMIN_API_KEY',
        'SANITY_PROJECT_ID',
        'SANITY_PROJECT_DATASET',
        'SANITY_API_TOKEN',
      ],
    })
  }

  try {
    // Handle DELETE - remove article from index
    if (req.method === 'DELETE') {
      const { articleId } = req.body
      if (!articleId) {
        return res.status(400).json({ error: 'articleId is required' })
      }

      const algoliaClient = getAlgoliaClient()
      await algoliaClient.deleteObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: articleId,
      })
      return res.status(200).json({ success: true, message: 'Article deleted from index' })
    }

    // Handle PUT - bulk sync all articles
    if (req.method === 'PUT') {
      const query = `
        *[_type == "article" && defined(date) && !(_id in path("drafts.**"))] | order(date desc){
          _id,
          _type,
          title,
          subtitle,
          "slug": slug.current,
          date,
          useGradient,
      gradient{
        type,
        direction,
        customAngle,
        colorStops[]{
          color{
            hex,
            rgb,
            alpha
          },
          position
        },
        height,
        padding
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
          content[],
          excerpt[],
          summary[]
        }
      `

      const articles = await sanity.fetch(query)
      const algoliaRecords = articles.map(transformArticleToAlgolia)

      const algoliaClient = getAlgoliaClient()
      await algoliaClient.saveObjects({
        indexName: ALGOLIA_INDEX_NAME,
        objects: algoliaRecords,
      })
      
      return res.status(200).json({
        success: true,
        message: `Synced ${algoliaRecords.length} articles to Algolia`,
        count: algoliaRecords.length,
      })
    }

    // Handle POST - sync single article (from webhook)
    if (req.method === 'POST') {
      const { _id, _type } = req.body

      // Validate it's an article
      if (_type !== 'article') {
        return res.status(200).json({
          message: 'Not an article, skipping sync',
          type: _type,
        })
      }

      // Get Algolia client
      const algoliaClient = getAlgoliaClient()

      // Check if article was deleted
      if (req.body.wasDeleted === true) {
        await algoliaClient.deleteObject({
          indexName: ALGOLIA_INDEX_NAME,
          objectID: _id,
        })
        return res.status(200).json({
          success: true,
          message: 'Article deleted from Algolia index',
        })
      }

      // Check if article is draft
      if (req.body.isDraft === true) {
        // Optionally delete draft from index or skip
        return res.status(200).json({
          message: 'Draft article, skipping sync',
        })
      }

      // Fetch full article data
      const article = await fetchArticleFromSanity(_id)
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' })
      }

      // Transform and save to Algolia
      const algoliaRecord = transformArticleToAlgolia(article)
      await algoliaClient.addOrUpdateObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: algoliaRecord.objectID,
        body: algoliaRecord,
      })

      return res.status(200).json({
        success: true,
        message: 'Article synced to Algolia',
        articleId: _id,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Algolia sync error:', error)
    return res.status(500).json({
      error: 'Failed to sync to Algolia',
      message: error.message,
    })
  }
}
