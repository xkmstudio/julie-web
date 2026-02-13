import axios from 'axios'
import {createClient} from '@sanity/client'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
const getRawBody = require('raw-body')
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

// Turn off default NextJS bodyParser, so we can run our own middleware
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function send(req, res) {
  // GET: diagnostic endpoint (no secrets) to verify webhook URL and env
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      endpoint: 'shopify/product-update',
      env: {
        hasSanityProjectId: !!process.env.SANITY_PROJECT_ID,
        hasSanityDataset: !!process.env.SANITY_PROJECT_DATASET,
        hasSanityToken: !!process.env.SANITY_API_TOKEN,
        hasShopifyWebhookSecret: !!process.env.SHOPIFY_WEBHOOK_INTEGRITY,
        hasShopifyAdminToken: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
        hasShopifyStoreId: !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID,
      },
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  /*  ------------------------------ */
  /*  1. Read raw body (once) for HMAC + parse
  /*  2. Check webhook integrity
  /*  ------------------------------ */

  let rawBody
  try {
    if (process.env.NETLIFY && req.body instanceof Buffer) {
      rawBody = req.body
    } else {
      rawBody = await getRawBody(req, { limit: '1mb' })
    }
    if (!rawBody || (typeof rawBody === 'string' && !rawBody.length)) {
      return res.status(200).json({ error: 'Missing request body' })
    }
    const rawString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody
    req.body = JSON.parse(rawString)
  } catch (e) {
    console.error('Failed to read/parse body:', e.message)
    return res.status(200).json({ error: 'Invalid JSON body', detail: e.message })
  }

  if (!process.env.SHOPIFY_WEBHOOK_INTEGRITY) {
    console.error('SHOPIFY_WEBHOOK_INTEGRITY is not set')
    return res.status(500).json({ error: 'Server misconfiguration: webhook secret not set' })
  }

  const hmac = req.headers['x-shopify-hmac-sha256']
  const rawForHmac = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8')
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_INTEGRITY)
    .update(rawForHmac)
    .digest('base64')

  // Add logging for debugging HMAC mismatches
  if (hmac !== generatedHash) {
    console.error('Unable to verify from Shopify');
    console.error('Received HMAC:', hmac);
    console.error('Generated HMAC:', generatedHash);
    console.error('Raw body (string):', rawBody.toString());
    return res.status(200).json({ error: 'Unable to verify from Shopify' });
  }

  // extract shopify data
  const {
    body: { status, id, title, handle, options = [], variants = [] },
  } = req

  if (!id || !title) {
    return res.status(200).json({ error: 'Missing product id or title in body' })
  }

  console.info(`Sync triggered for product: "${title}" (id: ${id})`)

  /*  ------------------------------ */
  /*  Construct our product objects
  /*  ------------------------------ */

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

  const firstVariant = variants[0]
  const productFields = {
    wasDeleted: false,
    isDraft: status === 'draft' ? true : false,
    productTitle: title,
    productID: id,
    slug: { current: handle || `product-${id}` },
    price: firstVariant?.price != null ? Number(firstVariant.price) * 100 : 0,
    comparePrice: firstVariant?.compare_at_price != null ? Number(firstVariant.compare_at_price) * 100 : 0,
    sku: firstVariant?.sku || '',
    inStock: variants.some(
      (v) => (v.inventory_quantity ?? 0) > 0 || v.inventory_policy === 'continue'
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
      price: variant.price != null ? Number(variant.price) * 100 : 0,
      comparePrice: variant.compare_at_price != null ? Number(variant.compare_at_price) * 100 : 0,
      sku: variant.sku || '',
      inStock:
        (variant.inventory_quantity ?? 0) > 0 ||
        variant.inventory_policy === 'continue',
      lowStock: (variant.inventory_quantity ?? 0) <= 5,
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

  /*  ------------------------------ */
  /*  Check for previous sync
  /*  ------------------------------ */

  console.log('Checking for previous sync data...')

  // Setup our Shopify connection
  const shopifyConfig = {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate,compress',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
  }

  // Fetch the metafields for this product
  let shopifyProduct
  let previousSync = null
  
  try {
    shopifyProduct = await axios({
      url: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID}.myshopify.com/admin/api/2023-10/products/${id}/metafields.json`,
      method: 'GET',
      headers: shopifyConfig,
    })

    // See if our metafield exists
    previousSync = shopifyProduct.data?.metafields?.find(
      (mf) => mf.key === 'product_sync'
    )
  } catch (error) {
    // If metafields endpoint fails (404 or other error), log it and continue
    // This can happen if the product doesn't have metafields yet or API version issues
    console.warn('Could not fetch metafields, proceeding with sync:', error.response?.status || error.message)
    previousSync = null
  }

  // Metafield found
  if (previousSync) {
    console.log('Previous sync found, comparing differences...')

    const diff = jsondiffpatch.diff(JSON.parse(previousSync.value), productCompare)
    if (!diff) {
      // No data changes — only skip if product actually exists in Sanity
      const existsInSanity = await sanity.fetch(
        `count(*[_type == "product" && _id == $id])`,
        { id: `product-${id}` }
      )
      if (existsInSanity > 0) {
        console.info('No differences found, product exists in Sanity, skip.')
        return res.status(200).json({ ok: true, skipped: true, reason: 'no changes' })
      }
      console.warn('No diff but product missing in Sanity — syncing.')
    } else {
      console.warn('Critical difference found! Start sync...')
      axios({
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
      }).catch((error) => {
        console.error('Failed to update metafield:', error.response?.status || error.message)
      })
    }
  } else {
    console.warn('No previous sync found, Start sync...')
    axios({
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
    }).catch((error) => {
      console.error('Failed to create metafield:', error.response?.status || error.message)
    })
  }

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')
  console.log('Sanity config:', {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_PROJECT_DATASET,
    hasToken: !!process.env.SANITY_API_TOKEN,
  })
  
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

  // patch (update) productHero module if none has been set
  // stx = stx.patch(`product-${id}`, (patch) =>
  //   patch.setIfMissing({
  //     contentModules: [
  //       {
  //         _key: nanoid(),
  //         _type: 'productHero',
  //         active: true,
  //       },
  //     ],
  //   })
  // )

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
    const result = await stx.commit()

    console.info('Sync complete!')
    console.log(result)

    res.statusCode = 200
    res.json(JSON.stringify(result))
  } catch (error) {
    console.error('Sanity sync error:', {
      message: error.message,
      statusCode: error.statusCode,
      responseBody: error.responseBody,
      details: error.details,
    })
    
    res.statusCode = error.statusCode || 500
    res.json({
      error: 'Failed to sync product to Sanity',
      message: error.message,
      statusCode: error.statusCode,
    })
  }
}
