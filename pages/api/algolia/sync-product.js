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
function getAlgoliaClient() {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    throw new Error('Algolia credentials are missing')
  }

  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_API_KEY
  )
}

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX_NAME || 'products'

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

// Transform Sanity product to Algolia record
function transformProductToAlgolia(product) {
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
        width: product.productThumbnail.width || null,
        height: product.productThumbnail.height || null,
        aspectRatio: product.productThumbnail.aspectRatio || null,
      }
    }
  }

  // Truncate description aggressively to prevent exceeding Algolia's 10KB limit
  const maxDescriptionLength = 2000 // Limit to ~2KB to leave room for other fields
  let description = product.description || ''
  if (description.length > maxDescriptionLength) {
    description = description.substring(0, maxDescriptionLength) + '...'
  }

  // Simplify options array - only keep essential fields
  const simplifiedOptions = (product.options || []).map((option) => ({
    name: option.name || '',
    values: option.values || [],
    // Remove position field to save space
  }))

  return {
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
    heroImage: heroImage,
    thumbnail: thumbnail,
    description: description,
    options: simplifiedOptions,
    _createdAt: product._createdAt,
    _updatedAt: product._updatedAt,
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

// Fetch full product data from Sanity
async function fetchProductFromSanity(productId) {
  const query = `
    *[_type == "product" && _id == $id][0]{
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
        "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height
      },
      productThumbnail{
        _type,
        _type == 'asset' => {
          alt,
          "asset": image.asset._ref,
          "url": image.asset->url,
          "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
          "width": image.asset->metadata.dimensions.width,
          "height": image.asset->metadata.dimensions.height
        }
      },
      "description": pt::text(description),
      options[]{
        name,
        values[]
      },
      _createdAt,
      _updatedAt
    }
  `

  return await sanity.fetch(query, { id: productId })
}

export default async function handler(req, res) {
  // Allow GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Algolia product sync API',
      endpoints: {
        POST: 'Sync single product (webhook)',
        PUT: 'Sync all products (bulk)',
        DELETE: 'Delete product from index',
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
    })
  }

  try {
    // Handle DELETE - remove product from index
    if (req.method === 'DELETE') {
      const { productId } = req.body
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' })
      }

      const algoliaClient = getAlgoliaClient()
      await algoliaClient.deleteObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: productId,
      })
      return res.status(200).json({ success: true, message: 'Product deleted from index' })
    }

    // Handle PUT - bulk sync all products
    if (req.method === 'PUT') {
      const query = `
        *[_type == "product" && !(_id in path("drafts.**")) && wasDeleted != true && isDraft != true] | order(_updatedAt desc){
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
      `

      const products = await sanity.fetch(query)
      const algoliaRecords = products.map(transformProductToAlgolia)

      const algoliaClient = getAlgoliaClient()
      await algoliaClient.saveObjects({
        indexName: ALGOLIA_INDEX_NAME,
        objects: algoliaRecords,
      })
      
      return res.status(200).json({
        success: true,
        message: `Synced ${algoliaRecords.length} products to Algolia`,
        count: algoliaRecords.length,
      })
    }

    // Handle POST - sync single product (from webhook)
    if (req.method === 'POST') {
      const { _id, _type } = req.body

      // Validate it's a product
      if (_type !== 'product') {
        return res.status(200).json({
          message: 'Not a product, skipping sync',
          type: _type,
        })
      }

      // Get Algolia client
      const algoliaClient = getAlgoliaClient()

      // Check if product was deleted
      if (req.body.wasDeleted === true) {
        await algoliaClient.deleteObject({
          indexName: ALGOLIA_INDEX_NAME,
          objectID: _id,
        })
        return res.status(200).json({ success: true, message: 'Product deleted from index' })
      }

      // Check if product is draft
      if (req.body.isDraft === true) {
        return res.status(200).json({ message: 'Product is draft, skipping sync' })
      }

      // Fetch full product data from Sanity
      const product = await fetchProductFromSanity(_id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Transform and sync to Algolia
      const algoliaRecord = transformProductToAlgolia(product)
      await algoliaClient.addOrUpdateObject({
        indexName: ALGOLIA_INDEX_NAME,
        object: algoliaRecord,
      })

      return res.status(200).json({
        success: true,
        message: 'Product synced to Algolia',
        productId: _id,
      })
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error in Algolia product sync:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
}





