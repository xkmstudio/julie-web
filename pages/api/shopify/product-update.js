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

// Debug logging: prefix all logs so you can filter in Netlify (e.g. "shopify-webhook")
const log = {
  step: (step, data = {}) => {
    console.log('[shopify-webhook]', step, JSON.stringify(data))
  },
  error: (step, err) => {
    console.error('[shopify-webhook]', step, err?.message || err, err?.response?.status, err?.responseBody || '')
  },
}

// Helper to send JSON with optional debug info (no secrets)
function sendJson(res, status, body) {
  const payload = typeof body === 'object' ? body : { message: body }
  payload.debug = { ...payload.debug, timestamp: new Date().toISOString() }
  return res.status(status).json(payload)
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
      debug: {
        logFilter: 'In Netlify: Functions → select deploy → Logs. Filter by "shopify-webhook" to see each step.',
      },
    })
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed', debug: { step: 'method' } })
  }

  log.step('received', { method: req.method, hasBody: !!req.body, contentType: req.headers['content-type'], hasHmac: !!req.headers['x-shopify-hmac-sha256'] })

  /*  ------------------------------ */
  /*  1. Read raw body (once) for HMAC + parse
  /*  2. Check webhook integrity
  /*  ------------------------------ */

  let rawBody
  try {
    if (process.env.NETLIFY && req.body instanceof Buffer) {
      rawBody = req.body
      log.step('body_source', { source: 'netlify_buffer', length: rawBody?.length })
    } else {
      rawBody = await getRawBody(req, { limit: '1mb' })
      log.step('body_source', { source: 'getRawBody', length: rawBody?.length })
    }
    if (!rawBody || (typeof rawBody === 'string' && !rawBody.length)) {
      log.step('exit', { step: 'body_empty' })
      return sendJson(res, 200, { error: 'Missing request body', debug: { step: 'body_empty' } })
    }
    const rawString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody
    req.body = JSON.parse(rawString)
    log.step('body_parsed', { productId: req.body?.id, title: req.body?.title })
  } catch (e) {
    log.error('body_parse', e)
    return sendJson(res, 200, { error: 'Invalid JSON body', detail: e.message, debug: { step: 'body_parse' } })
  }

  if (!process.env.SHOPIFY_WEBHOOK_INTEGRITY) {
    log.step('exit', { step: 'missing_webhook_secret' })
    return sendJson(res, 500, { error: 'Server misconfiguration: webhook secret not set', debug: { step: 'missing_webhook_secret' } })
  }

  const hmac = req.headers['x-shopify-hmac-sha256']
  const rawForHmac = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8')
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_INTEGRITY)
    .update(rawForHmac)
    .digest('base64')

  if (hmac !== generatedHash) {
    const bodyPreview = (Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody)).slice(0, 80)
    log.step('exit', { step: 'hmac_fail', hasHmac: !!hmac, bodyPreview })
    return sendJson(res, 200, {
      error: 'Unable to verify from Shopify',
      debug: { step: 'hmac_fail', hint: 'Check SHOPIFY_WEBHOOK_INTEGRITY matches the secret in Shopify webhook settings' },
    })
  }

  log.step('hmac_ok', {})

  // extract shopify data
  const {
    body: { status, id, title, handle, options = [], variants = [] },
  } = req

  if (!id || !title) {
    log.step('exit', { step: 'missing_fields', id: !!id, title: !!title })
    return sendJson(res, 200, { error: 'Missing product id or title in body', debug: { step: 'missing_fields' } })
  }

  log.step('sync_start', { productId: id, title, variantCount: variants?.length })

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

  log.step('metafield_check', { productId: id })

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
    log.error('metafield_fetch', error)
    previousSync = null
  }

  log.step('metafield_result', { hadPreviousSync: !!previousSync })

  // Metafield found
  if (previousSync) {
    const diff = jsondiffpatch.diff(JSON.parse(previousSync.value), productCompare)
    if (!diff) {
      const existsInSanity = await sanity.fetch(
        `count(*[_type == "product" && _id == $id])`,
        { id: `product-${id}` }
      )
      log.step('diff_check', { noDiff: true, existsInSanity: existsInSanity > 0 })
      if (existsInSanity > 0) {
        return sendJson(res, 200, { ok: true, skipped: true, reason: 'no changes', debug: { step: 'skip_no_changes' } })
      }
      log.step('sync_reason', { reason: 'missing_in_sanity' })
    } else {
      log.step('sync_reason', { reason: 'data_changed' })
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
      }).catch((err) => log.error('metafield_put', err))
    }
  } else {
    log.step('sync_reason', { reason: 'new_product_no_metafield' })
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
    }).catch((err) => log.error('metafield_post', err))
  }

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  log.step('sanity_write_start', { productId: id, projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_PROJECT_DATASET, hasToken: !!process.env.SANITY_API_TOKEN })

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
    log.step('sanity_write_ok', { productId: id, transactionId: result?.transactionId })
    return sendJson(res, 200, {
      ok: true,
      synced: true,
      productId: id,
      transactionId: result?.transactionId,
      debug: { step: 'sanity_commit' },
    })
  } catch (error) {
    log.error('sanity_commit', error)
    return sendJson(res, error.statusCode || 500, {
      error: 'Failed to sync product to Sanity',
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      responseBody: error.responseBody,
      debug: { step: 'sanity_error', hint: 'Check SANITY_API_TOKEN has create+edit permissions' },
    })
  }
}
