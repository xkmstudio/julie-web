// Standalone Netlify Function for generating page preview screenshots
// Uses ScreenshotAPI.com for reliable screenshot generation in serverless environments

const sanityClient = require('@sanity/client')

// Create Sanity client
const sanity = sanityClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
})

// Aspect ratio matching our plane dimensions
const PREVIEW_WIDTH = 1200
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * 1.414) // A4-like ratio

// Screenshot service configuration
// Option 1: Microlink.io (free, no API key needed)
// Option 2: htmlcsstoimage.com (requires API key)
// Option 3: urlbox.io (requires API key)
const SCREENSHOT_SERVICE = process.env.SCREENSHOT_SERVICE || 'microlink'
const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY

exports.handler = async (event, context) => {
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`\n\n=== [${requestId}] Preview Generation Webhook Received ===`)
  console.log(`[${requestId}] Method:`, event.httpMethod)
  console.log(`[${requestId}] Body:`, event.body)
  
  // Parse body
  let body
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  } catch (e) {
    console.error(`[${requestId}] Failed to parse body:`, e)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON body', error: e.message }),
    }
  }
  
  // Extract data
  let documentId = body._id
  let documentType = body._type
  let slug = body.slug
  
  // Handle nested slug
  if (slug && typeof slug === 'object') {
    slug = slug.current || slug
  }
  
  console.log(`[${requestId}] Extracted data:`, { documentId, documentType, slug })
  
  if (!documentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        message: 'Document ID (_id) is required',
        receivedBody: body,
      }),
    }
  }
  
  try {
    // Fetch document type and slug if not provided
    if (!documentType || (!slug && documentType !== 'tutorialsPage')) {
      console.log(`[${requestId}] Fetching document details for:`, documentId)
      const doc = await sanity.fetch(
        `*[_id == "${documentId}"][0]{ _type, "slug": coalesce(slug.current, "") }`
      )
      if (doc) {
        documentType = documentType || doc._type
        if (documentType !== 'tutorialsPage') {
          slug = slug || doc.slug
        }
        console.log(`[${requestId}] Found document:`, { type: documentType, slug: slug || 'N/A (tutorialsPage)' })
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Document not found', documentId }),
        }
      }
    }
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopteorema.netlify.app'
    console.log(`[${requestId}] Base URL:`, baseUrl)
    
    // Determine if home page
    let isHomePage = false
    if (documentType === 'page') {
      const homePageId = await sanity.fetch(
        `*[_type=="generalSettings"][0].home->_id`
      )
      isHomePage = documentId === homePageId
      console.log(`[${requestId}] Is home page:`, isHomePage)
    }
    
    // Construct page URL
    let pageUrl
    if (isHomePage) {
      pageUrl = baseUrl
    } else if (documentType === 'product') {
      if (!slug) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Product requires slug', documentId, documentType }),
        }
      }
      pageUrl = `${baseUrl}/products/${slug}`
    } else if (documentType === 'collection') {
      if (!slug) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Collection requires slug', documentId, documentType }),
        }
      }
      pageUrl = `${baseUrl}/shop/${slug}`
    } else if (documentType === 'tutorialsPage') {
      pageUrl = `${baseUrl}/tutorials`
    } else if (documentType === 'page') {
      pageUrl = slug ? `${baseUrl}/pages/${slug}` : baseUrl
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Unsupported document type',
          documentType,
          supportedTypes: ['page', 'product', 'collection', 'tutorialsPage'],
        }),
      }
    }
    
    console.log(`[${requestId}] Generating preview for: ${pageUrl}`)
    
    // Use external screenshot service (more reliable than Puppeteer in serverless)
    let screenshotBuffer
    try {
      console.log(`[${requestId}] Generating screenshot using ${SCREENSHOT_SERVICE}...`)
      
      if (SCREENSHOT_SERVICE === 'microlink') {
        // Microlink.io - Free, no API key needed
        // Try direct screenshot endpoint first (faster)
        // Docs: https://microlink.io/docs/api/getting-started/overview
        console.log(`[${requestId}] Attempting direct screenshot URL first...`)
        
        // Try direct screenshot endpoint (faster, no JSON parsing needed)
        const directScreenshotUrl = `https://api.microlink.io/screenshot?url=${encodeURIComponent(pageUrl)}&viewport.width=${PREVIEW_WIDTH}&viewport.height=${PREVIEW_HEIGHT}&waitFor=500&fullPage=true`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s max
        
        try {
          console.log(`[${requestId}] Calling Microlink direct screenshot: ${directScreenshotUrl}`)
          const screenshotResponse = await fetch(directScreenshotUrl, {
            method: 'GET',
            headers: {
              'Accept': 'image/png',
            },
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (screenshotResponse.ok && screenshotResponse.headers.get('content-type')?.includes('image')) {
            // Direct image response - much faster!
            screenshotBuffer = Buffer.from(await screenshotResponse.arrayBuffer())
            console.log(`[${requestId}] ✅ Direct screenshot captured, size: ${screenshotBuffer.length} bytes`)
          } else {
            // Fallback to JSON API
            console.log(`[${requestId}] Direct screenshot failed, trying JSON API...`)
            const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(pageUrl)}&screenshot=true&viewport.width=${PREVIEW_WIDTH}&viewport.height=${PREVIEW_HEIGHT}&waitFor=500&fullPage=true&meta=false`
            
            const jsonResponse = await fetch(microlinkUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              signal: controller.signal,
            })
            
            if (!jsonResponse.ok) {
              const errorText = await jsonResponse.text()
              throw new Error(`Microlink failed: ${jsonResponse.status} ${errorText}`)
            }
            
            const microlinkData = await jsonResponse.json()
            console.log(`[${requestId}] Microlink JSON response received`)
            
            if (!microlinkData.data || !microlinkData.data.screenshot) {
              throw new Error(`Microlink response missing screenshot: ${JSON.stringify(microlinkData)}`)
            }
            
            // Download the screenshot image
            const imageResponse = await fetch(microlinkData.data.screenshot.url, {
              signal: controller.signal,
            })
            
            if (!imageResponse.ok) {
              throw new Error(`Failed to download screenshot: ${imageResponse.status}`)
            }
            
            screenshotBuffer = Buffer.from(await imageResponse.arrayBuffer())
            console.log(`[${requestId}] Screenshot captured via Microlink JSON API, size: ${screenshotBuffer.length} bytes`)
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          if (fetchError.name === 'AbortError') {
            throw new Error('Microlink API call timed out after 25 seconds')
          }
          throw fetchError
        }
      } else if (SCREENSHOT_SERVICE === 'htmlcsstoimage') {
        // htmlcsstoimage.com - Requires API key
        if (!SCREENSHOT_API_KEY) {
          throw new Error('SCREENSHOT_API_KEY is required for htmlcsstoimage service')
        }
        
        // Fetch the page HTML first
        const htmlResponse = await fetch(pageUrl)
        const html = await htmlResponse.text()
        
        const hctiResponse = await fetch('https://hcti.io/v1/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(SCREENSHOT_API_KEY + ':').toString('base64')}`,
          },
          body: JSON.stringify({
            html: html,
            width: PREVIEW_WIDTH,
            device_scale_factor: 2,
          }),
        })
        
        if (!hctiResponse.ok) {
          const errorText = await hctiResponse.text()
          throw new Error(`htmlcsstoimage failed: ${hctiResponse.status} ${errorText}`)
        }
        
        const hctiData = await hctiResponse.json()
        const imageResponse = await fetch(hctiData.url)
        screenshotBuffer = Buffer.from(await imageResponse.arrayBuffer())
        console.log(`[${requestId}] Screenshot captured via htmlcsstoimage, size: ${screenshotBuffer.length} bytes`)
      } else {
        throw new Error(`Unknown screenshot service: ${SCREENSHOT_SERVICE}`)
      }
      
      // Upload to Sanity
      const filename = documentType === 'tutorialsPage' 
        ? `tutorialsPage-preview.png`
        : `${documentType}-${slug || documentId}-preview.png`
      
      const asset = await sanity.assets.upload('image', screenshotBuffer, {
        filename: filename,
        contentType: 'image/png',
      })
      
      console.log(`[${requestId}] Uploaded asset: ${asset._id}`)
      
      // Update document
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
        throw new Error(`Sanity mutation failed: ${JSON.stringify(mutationResult)}`)
      }
      
      console.log(`[${requestId}] ✅ Successfully updated ${documentType} ${documentId} with preview image`)
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Preview generated and uploaded successfully',
          assetId: asset._id,
          pageId: documentId,
          pageUrl,
        }),
      }
    } catch (screenshotError) {
      console.error(`[${requestId}] ❌ Screenshot generation error:`, screenshotError)
      throw screenshotError
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Error generating preview:`, error)
    console.error(`[${requestId}] Error stack:`, error.stack)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error generating preview',
        error: error.message,
        documentId,
        documentType,
        slug,
        requestId,
      }),
    }
  }
}
