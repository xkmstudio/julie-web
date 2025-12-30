// Proxy route for LuckyLabs app-proxy requests
// Matches the Hydrogen/Remix route structure: apps.app-proxy.$.jsx
// This handles requests to /apps/app-proxy/*

const prefixPath = '/apps/app-proxy'

const makeLuckyAppRequest = async (req) => {
  const LUCKY_API_KEY = process.env.LUCKY_API_KEY
  const LUCKY_EXT_API_URL = process.env.LUCKY_EXT_API_URL

  if (!LUCKY_API_KEY || !LUCKY_EXT_API_URL) {
    throw new Error('Missing LUCKY_API_KEY or LUCKY_EXT_API_URL environment variables')
  }

  // Get the path segments from the catch-all route
  // For /apps/app-proxy/shopify/is_store_locator_enabled
  // req.query.path will be: ['shopify', 'is_store_locator_enabled']
  const path = req.query.path || []
  const pathSegments = Array.isArray(path) ? path : [path]
  
  // Reconstruct the original request path (before middleware rewrite)
  // Original: /apps/app-proxy/shopify/is_store_locator_enabled
  const requestPath = '/' + pathSegments.join('/')
  const originalRequestPath = prefixPath + requestPath

  // Build target URL matching Hydrogen logic:
  // newUrl.pathname = `${luckyURL.pathname}${newUrl.pathname}`.replace(prefixPath, '')
  const luckyURL = new URL(LUCKY_EXT_API_URL)
  
  // Apply Hydrogen logic: base + original path, then remove prefix
  let targetPathname = `${luckyURL.pathname}${originalRequestPath}`.replace(prefixPath, '')
  
  // Fix duplicate /shopify if base ends with /shopify and path starts with /shopify
  // Example: /v1/shopify/shopify/is_store_locator_enabled -> /v1/shopify/is_store_locator_enabled
  if (luckyURL.pathname.endsWith('/shopify') && targetPathname.includes('/shopify/shopify/')) {
    targetPathname = targetPathname.replace('/shopify/shopify/', '/shopify/')
  }
  
  targetPathname = targetPathname.replace(/\/+/g, '/') // Clean up double slashes
  
  // Build final URL
  const targetUrl = new URL(targetPathname, luckyURL.origin)
  targetUrl.protocol = 'https'
  targetUrl.port = ''
  
  // Copy query parameters
  if (req.url && req.url.includes('?')) {
    const queryString = req.url.split('?')[1]
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value)
    })
  }
  
  console.log('🔗 [API Route] URL construction:', {
    originalRequestPath,
    luckyBasePath: luckyURL.pathname,
    targetPathname,
    finalURL: targetUrl.toString(),
  })

  // Prepare the request
  const requestOptions = {
    method: req.method,
    headers: {
      'Authorization': `Key ${LUCKY_API_KEY}`,
    },
  }

  // Copy headers from the original request
  const headersToForward = ['content-type', 'accept', 'accept-language', 'user-agent']
  headersToForward.forEach(header => {
    if (req.headers[header]) {
      requestOptions.headers[header] = req.headers[header]
    }
  })

  // Include body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    requestOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  return fetch(targetUrl.toString(), requestOptions)
}

export default async function handler(req, res) {
  // Log the request for debugging
  console.log('📡 [API Route] App-proxy request received:', {
    method: req.method,
    url: req.url,
    pathname: req.url.split('?')[0],
    path: req.query.path,
    query: req.query,
    hasApiKey: !!process.env.LUCKY_API_KEY,
    hasApiUrl: !!process.env.LUCKY_EXT_API_URL,
  })
  
  // If env vars are missing, return helpful error
  if (!process.env.LUCKY_API_KEY || !process.env.LUCKY_EXT_API_URL) {
    console.error('❌ Missing environment variables:', {
      hasApiKey: !!process.env.LUCKY_API_KEY,
      hasApiUrl: !!process.env.LUCKY_EXT_API_URL,
    })
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Missing LUCKY_API_KEY or LUCKY_EXT_API_URL environment variables',
    })
  }

  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Handle POST method check (matching Hydrogen action)
  if (req.method === 'POST') {
    try {
      const response = await makeLuckyAppRequest(req)
      const data = await response.json()

      console.log('✅ App-proxy POST success:', response.status)
      res.status(response.status)
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return res.json(data)
    } catch (error) {
      console.error('❌ LuckyLabs app-proxy POST error:', error)
      return res.status(500).json({
        error: 'Proxy request failed',
        message: error.message,
      })
    }
  }

  // Handle GET and other methods (matching Hydrogen loader)
  try {
    const response = await makeLuckyAppRequest(req)
    const data = await response.json()

    console.log('✅ App-proxy GET success:', response.status)
    res.status(response.status)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return res.json(data)
  } catch (error) {
    console.error('❌ LuckyLabs app-proxy GET error:', error)
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    })
  }
}

