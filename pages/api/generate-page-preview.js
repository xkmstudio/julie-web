// API route to generate page preview screenshots
// This can be called from Sanity webhooks when a page is published
// Uses @sparticuz/chromium for serverless compatibility on Netlify

import puppeteer from 'puppeteer-core'
import sanityClient from '@sanity/client'

// Use regular puppeteer in development, chromium in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY

// Create Sanity client with write permissions - matching your pattern
const sanity = sanityClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
})

// Aspect ratio matching our plane dimensions (width: 20, height: ~28.28)
const PREVIEW_WIDTH = 1200
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * 1.414) // A4-like ratio

export default async function handler(req, res) {
  // Log the incoming request for debugging - ALWAYS log, even if it fails
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`\n\n=== [${requestId}] Preview Generation Webhook Received ===`)
    console.log(`[${requestId}] Method:`, req.method)
    console.log(`[${requestId}] URL:`, req.url)
    console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2))
    console.log(`[${requestId}] Body:`, JSON.stringify(req.body, null, 2))
    console.log(`[${requestId}] Environment:`, {
      isProduction,
      hasNetlify: !!process.env.NETLIFY,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (logError) {
    console.error(`[${requestId}] Error in initial logging:`, logError)
  }

  // Allow GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Preview generation API is running',
      endpoint: '/api/generate-page-preview',
      method: 'POST',
      requiredFields: ['_id', 'slug'],
      requestId,
    })
  }

  if (req.method !== 'POST') {
    console.log(`[${requestId}] ❌ Method not allowed:`, req.method)
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Optional: Add webhook secret for security
  const webhookSecret = req.headers['x-webhook-secret']
  const hasWebhookSecret = !!process.env.WEBHOOK_SECRET
  console.log(`[${requestId}] Webhook secret check:`, {
    hasEnvSecret: hasWebhookSecret,
    receivedSecret: !!webhookSecret,
    matches: hasWebhookSecret ? webhookSecret === process.env.WEBHOOK_SECRET : 'N/A',
  })
  
  if (hasWebhookSecret && webhookSecret !== process.env.WEBHOOK_SECRET) {
    console.error(`[${requestId}] ❌ Webhook secret mismatch`)
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Sanity webhooks send the document data directly in the body
  // The structure depends on the projection you set in the webhook
  let documentId = req.body._id
  let documentType = req.body._type
  let slug = req.body.slug

  // If webhook projection sends nested data, extract it
  if (req.body.slug && typeof req.body.slug === 'object') {
    slug = req.body.slug.current || req.body.slug
  }

  // Fallback to direct body properties
  if (!documentId) {
    documentId = req.body.pageId || req.body.id
  }
  if (!documentType) {
    documentType = req.body.type
  }
  if (!slug && req.body.slug) {
    slug = typeof req.body.slug === 'string' ? req.body.slug : req.body.slug.current
  }

  console.log(`[${requestId}] Extracted data:`, { documentId, documentType, slug })

  if (!documentId) {
    console.error(`[${requestId}] ❌ No document ID found in webhook payload`)
    return res.status(400).json({ 
      message: 'Document ID (_id) is required',
      receivedBody: req.body 
    })
  }

  try {
    // Fetch document type and slug if not provided
    // Note: tutorialsPage doesn't need a slug (URL is hardcoded to /tutorials)
    if (!documentType || (!slug && documentType !== 'tutorialsPage')) {
      console.log(`[${requestId}] Fetching document details for:`, documentId)
      const doc = await sanity.fetch(
        `*[_id == "${documentId}"][0]{ _type, "slug": coalesce(slug.current, "") }`
      )
      if (doc) {
        documentType = documentType || doc._type
        // Only set slug if document type requires it
        if (documentType !== 'tutorialsPage') {
          slug = slug || doc.slug
        }
        console.log(`[${requestId}] Found document:`, { type: documentType, slug: slug || 'N/A (tutorialsPage)' })
      } else {
        console.error(`[${requestId}] Document not found:`, documentId)
        return res.status(404).json({ message: 'Document not found', documentId })
      }
    }

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    console.log(`[${requestId}] Base URL:`, baseUrl)
    
    // Determine if this is the home page (only for page type)
    let isHomePage = false
    if (documentType === 'page') {
      const homePageId = await sanity.fetch(
        `*[_type=="generalSettings"][0].home->_id`
      )
      isHomePage = documentId === homePageId
      console.log(`[${requestId}] Is home page:`, isHomePage, 'Home page ID:', homePageId)
    }
    
    // Construct page URL based on document type
    let pageUrl
    if (isHomePage) {
      pageUrl = baseUrl
    } else if (documentType === 'product') {
      if (!slug) {
        console.error(`[${requestId}] Product requires slug`)
        return res.status(400).json({ message: 'Product requires slug', documentId, documentType })
      }
      pageUrl = `${baseUrl}/products/${slug}`
    } else if (documentType === 'collection') {
      if (!slug) {
        console.error(`[${requestId}] Collection requires slug`)
        return res.status(400).json({ message: 'Collection requires slug', documentId, documentType })
      }
      pageUrl = `${baseUrl}/shop/${slug}`
    } else if (documentType === 'tutorialsPage') {
      // tutorialsPage doesn't need a slug - URL is hardcoded
      pageUrl = `${baseUrl}/tutorials`
    } else if (documentType === 'page') {
      pageUrl = slug ? `${baseUrl}/pages/${slug}` : baseUrl
    } else {
      console.error(`[${requestId}] Unknown document type:`, documentType)
      return res.status(400).json({ 
        message: 'Unsupported document type',
        documentType,
        supportedTypes: ['page', 'product', 'collection', 'tutorialsPage']
      })
    }

    console.log(`[${requestId}] Generating preview for: ${pageUrl}`)
    console.log(`[${requestId}] Document ID: ${documentId}`)
    console.log(`[${requestId}] Document Type: ${documentType}`)

    // Launch Puppeteer - use Chromium for serverless, regular Puppeteer for local dev
    let browser
    
    if (isProduction) {
      // Dynamically import chromium only when needed in production
      // This helps avoid bundling issues with Next.js
      let chromium
      try {
        console.log(`[${requestId}] Attempting to import @sparticuz/chromium...`)
        const chromiumModule = await import('@sparticuz/chromium')
        chromium = chromiumModule.default || chromiumModule
        console.log(`[${requestId}] ✅ Successfully imported @sparticuz/chromium`)
        console.log(`[${requestId}] Chromium module keys:`, Object.keys(chromium))
      } catch (importError) {
        console.error(`[${requestId}] ❌ Failed to import @sparticuz/chromium:`, importError)
        console.error(`[${requestId}] Import error details:`, {
          message: importError.message,
          stack: importError.stack,
          name: importError.name,
        })
        throw new Error(`Failed to import chromium: ${importError.message}`)
      }
      
      // Use Chromium for serverless environments (Netlify)
      // Note: setGraphicsMode may not be available in all versions
      if (typeof chromium.setGraphicsMode === 'function') {
        chromium.setGraphicsMode(false) // Disable graphics for serverless
      }
      
      try {
        // Try to get the chromium executable path
        const executablePath = await chromium.executablePath()
        console.log(`[${requestId}] Chromium executable path: ${executablePath}`)
        
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        })
      } catch (chromiumError) {
        console.error(`[${requestId}] Error with chromium.executablePath():`, chromiumError)
        console.error(`[${requestId}] Chromium error details:`, {
          message: chromiumError.message,
          stack: chromiumError.stack,
        })
        throw chromiumError // Re-throw to be caught by outer try-catch
      }
    } else {
      // Use regular Puppeteer for local development
      const puppeteerFull = await import('puppeteer')
      browser = await puppeteerFull.default.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      })
    }

    try {
      const page = await browser.newPage()

      // Set viewport to match our plane aspect ratio
      await page.setViewport({
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        deviceScaleFactor: 2, // Higher DPI for better quality
      })

      // Navigate to the page and wait for it to load
      await page.goto(pageUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      // Wait a bit more for any animations or lazy-loaded content
      await page.waitForTimeout(1000)

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
      })

      await browser.close()

      console.log(`[${requestId}] Screenshot captured, size: ${screenshot.length} bytes`)

      // Upload to Sanity - screenshot is already a Buffer
      // Generate filename based on document type
      const filename = documentType === 'tutorialsPage' 
        ? `tutorialsPage-preview.png`
        : `${documentType}-${slug || documentId}-preview.png`
      const asset = await sanity.assets.upload('image', screenshot, {
        filename: filename,
        contentType: 'image/png',
      })

      console.log(`[${requestId}] Uploaded asset: ${asset._id}`)

      // Update the document using direct API mutation (matching your pattern)
      const mutations = [{
        patch: {
          id: documentId,
          set: {
            previewImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id,
              },
            },
          },
        },
      }]

      const mutationResponse = await fetch(
        `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.SANITY_PROJECT_DATASET}`,
        {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
          },
          body: JSON.stringify({ mutations }),
        }
      )

      const mutationResult = await mutationResponse.json()

      if (!mutationResponse.ok) {
        console.error('Mutation failed:', mutationResult)
        throw new Error(`Sanity mutation failed: ${JSON.stringify(mutationResult)}`)
      }

      console.log(`[${requestId}] ✅ Successfully updated ${documentType} ${documentId} with preview image`)
      console.log(`[${requestId}] Mutation result:`, JSON.stringify(mutationResult, null, 2))

      res.status(200).json({
        success: true,
        message: 'Preview generated and uploaded successfully',
        assetId: asset._id,
        pageId: documentId,
        pageUrl,
        mutationResult,
      })
    } catch (puppeteerError) {
      await browser.close()
      throw puppeteerError
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Error generating preview:`, error)
    console.error(`[${requestId}] Error stack:`, error.stack)
    console.error(`[${requestId}] Error details:`, {
      message: error.message,
      name: error.name,
      documentId,
      documentType,
      slug,
    })

    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error generating preview',
        error: error.message,
        documentId,
        documentType,
        slug,
        requestId,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
    } else {
      console.error(`[${requestId}] Response already sent, cannot send error response`)
    }
  }
}

