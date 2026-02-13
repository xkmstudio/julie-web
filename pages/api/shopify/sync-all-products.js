import axios from 'axios'
import {createClient} from '@sanity/client'
import { nanoid } from 'nanoid'
const jsondiffpatch = require('jsondiffpatch')

// Validate required environment variables
if (!process.env.SANITY_PROJECT_DATASET || !process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
  console.error('Missing Sanity environment variables:', {
    hasDataset: !!process.env.SANITY_PROJECT_DATASET,
    hasProjectId: !!process.env.SANITY_PROJECT_ID,
    hasToken: !!process.env.SANITY_API_TOKEN,
  })
}

const sanity = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
})

// Setup our Shopify connection
const shopifyConfig = {
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip,deflate,compress',
  'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
}

// Sync a single product to Sanity
async function syncProductToSanity(productData) {
  const { id, title, handle, status, options = [], variants = [] } = productData

  // Define product document
  const product = {
    _type: 'product',
    _id: `product-${id}`,
  }

  // Define product options if there are more than one variant
  const productOptions =
    variants?.length > 1
      ? options.map((option) => ({
          _key: option.id,
          _type: 'productOption',
          name: option.name,
          values: option.values,
          position: option.position,
        }))
      : []

  // Define product fields
  const productFields = {
    wasDeleted: false,
    isDraft: status === 'draft' ? true : false,
    productTitle: title,
    productID: id,
    slug: { current: handle },
    price: variants[0]?.price ? variants[0].price * 100 : 0,
    comparePrice: variants[0]?.compare_at_price ? variants[0].compare_at_price * 100 : 0,
    sku: variants[0]?.sku || '',
    inStock: variants.some(
      (v) => v.inventory_quantity > 0 || v.inventory_policy === 'continue'
    ),
    lowStock:
      variants.reduce((a, b) => a + (b.inventory_quantity || 0), 0) <= 10,
    options: productOptions,
  }

  // Define productVariant documents
  const productVariants = variants
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((variant) => ({
      _type: 'productVariant',
      _id: `productVariant-${variant.id}`,
    }))

  // Define productVariant fields
  const productVariantFields = variants
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((variant) => ({
      isDraft: status === 'draft' ? true : false,
      wasDeleted: false,
      productTitle: title,
      productID: id,
      variantTitle: variant.title,
      variantID: variant.id,
      price: variant.price ? variant.price * 100 : 0,
      comparePrice: variant.compare_at_price ? variant.compare_at_price * 100 : 0,
      sku: variant.sku || '',
      inStock:
        variant.inventory_quantity > 0 ||
        variant.inventory_policy === 'continue',
      lowStock: variant.inventory_quantity <= 5,
      options:
        variants.length > 1
          ? options.map((option) => ({
              _key: option.id,
              _type: 'productOptionValue',
              name: option.name,
              value: variant[`option${option.position}`],
              position: option.position,
            }))
          : [],
    }))

  // construct our comparative product object
  const productCompare = {
    ...product,
    ...productFields,
    ...{
      variants: productVariants.map((variant, key) => ({
        ...variant,
        ...productVariantFields[key],
      })),
    },
  }

  // Check for previous sync via metafields
  let previousSync = null
  try {
    const shopifyProduct = await axios({
      url: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID}.myshopify.com/admin/api/2023-10/products/${id}/metafields.json`,
      method: 'GET',
      headers: shopifyConfig,
    })
    previousSync = shopifyProduct.data?.metafields?.find(
      (mf) => mf.key === 'product_sync'
    )
  } catch (error) {
    // If metafields endpoint fails, continue with sync
    previousSync = null
  }

  // Skip if no differences found (only if previous sync exists)
  // But always sync if the product doesn't exist in Sanity (e.g. was deleted or never created)
  if (previousSync) {
    const diff = jsondiffpatch.diff(JSON.parse(previousSync.value), productCompare)
    if (!diff) {
      const existsInSanity = await sanity.fetch(
        `count(*[_type == "product" && _id == $id])`,
        { id: `product-${id}` }
      )
      if (existsInSanity > 0) {
        return { id, title, status: 'skipped', reason: 'no changes' }
      }
      // Product missing in Sanity — fall through and sync
    }
  }

  // Update or create metafield
  try {
    if (previousSync) {
      await axios({
        url: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID}.myshopify.com/admin/api/2023-10/products/${id}/metafields/${previousSync.id}.json`,
        method: 'PUT',
        headers: shopifyConfig,
        data: {
          metafield: {
            id: previousSync.id,
            value: JSON.stringify(productCompare),
            type: 'json',
          },
        },
      })
    } else {
      await axios({
        url: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID}.myshopify.com/admin/api/2023-10/products/${id}/metafields.json`,
        method: 'POST',
        headers: shopifyConfig,
        data: {
          metafield: {
            namespace: 'sanity',
            key: 'product_sync',
            value: JSON.stringify(productCompare),
            type: 'json',
          },
        },
      })
    }
  } catch (error) {
    console.warn(`Failed to update metafield for product ${id}:`, error.response?.status || error.message)
  }

  // Sync to Sanity
  let stx = sanity.transaction()

  // create product if doesn't exist
  stx = stx.createIfNotExists(product)

  // unset options field first, to avoid patch set issues
  stx = stx.patch(`product-${id}`, (patch) => patch.unset(['options']))

  // patch (update) product document with core shopify data
  stx = stx.patch(`product-${id}`, (patch) => patch.set(productFields))

  // patch (update) title & slug if none has been set
  stx = stx.patch(`product-${id}`, (patch) =>
    patch.setIfMissing({ title: title })
  )

  // create variant if doesn't exist & patch (update) variant with core shopify data
  productVariants.forEach((variant, i) => {
    stx = stx.createIfNotExists(variant)
    stx = stx.patch(variant._id, (patch) => patch.set(productVariantFields[i]))
    stx = stx.patch(variant._id, (patch) =>
      patch.setIfMissing({ title: productVariantFields[i].variantTitle })
    )
  })

  // grab current variants
  const currentVariants = await sanity.fetch(
    `*[_type == "productVariant" && productID == ${id}]{
      _id
    }`
  )

  // mark deleted variants
  currentVariants.forEach((cv) => {
    const active = productVariants.some((v) => v._id === cv._id)
    if (!active) {
      stx = stx.patch(cv._id, (patch) => patch.set({ wasDeleted: true }))
    }
  })

  try {
    await stx.commit()
    return { id, title, status: 'synced' }
  } catch (error) {
    console.error(`Failed to sync product ${id} (${title}):`, error.message)
    return { id, title, status: 'error', error: error.message }
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Optional: Add a simple secret check to prevent unauthorized access
  // You can set SYNC_SECRET in your env vars for extra security
  if (process.env.SYNC_SECRET && req.body?.secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('Starting bulk product sync...')

    // Fetch all products from Shopify (with pagination)
    let allProducts = []
    let hasNextPage = true
    let pageInfo = null

    while (hasNextPage) {
      let url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID}.myshopify.com/admin/api/2023-10/products.json?limit=250&status=active`
      
      if (pageInfo) {
        url += `&page_info=${pageInfo}`
      }

      const response = await axios({
        url,
        method: 'GET',
        headers: shopifyConfig,
      })

      const products = response.data.products || []
      allProducts = allProducts.concat(products)

      // Check for next page
      const linkHeader = response.headers.link
      const nextPageMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)
      
      if (nextPageMatch && nextPageMatch[1]) {
        const nextUrl = new URL(nextPageMatch[1])
        pageInfo = nextUrl.searchParams.get('page_info')
        hasNextPage = !!pageInfo
      } else {
        hasNextPage = false
      }

      console.log(`Fetched ${products.length} products (total so far: ${allProducts.length})`)
    }

    console.log(`Total products to sync: ${allProducts.length}`)

    // Sync each product
    const results = []
    for (const product of allProducts) {
      const result = await syncProductToSanity(product)
      results.push(result)
      
      // Log progress
      if (results.length % 10 === 0) {
        console.log(`Progress: ${results.length}/${allProducts.length} products processed`)
      }
    }

    // Count results
    const synced = results.filter(r => r.status === 'synced').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const errors = results.filter(r => r.status === 'error').length

    console.log(`Bulk sync complete! Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`)

    res.status(200).json({
      success: true,
      summary: {
        total: allProducts.length,
        synced,
        skipped,
        errors,
      },
      results,
    })
  } catch (error) {
    console.error('Bulk sync error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
