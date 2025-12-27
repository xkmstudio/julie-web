// Proxy route for LuckyLabs API requests
// Matches the Hydrogen/Remix route structure from the working site
// This proxies requests from /lucky-local/shopify/* to the LuckyLabs API

const makeLuckyAppRequest = async (req) => {
  const LUCKY_API_KEY = process.env.LUCKY_API_KEY
  const LUCKY_EXT_API_URL = process.env.LUCKY_EXT_API_URL

  if (!LUCKY_API_KEY || !LUCKY_EXT_API_URL) {
    throw new Error('Missing LUCKY_API_KEY or LUCKY_EXT_API_URL environment variables')
  }

  // Get the path from the catch-all route
  const path = req.query.path || []
  const requestPath = Array.isArray(path) ? path.join('/') : path

  // Build the target URL (matching the Hydrogen route logic)
  const luckyURL = new URL(LUCKY_EXT_API_URL)
  const prefixPath = '/lucky-local/shopify'
  
  // Remove the prefix and build the target path
  let targetPath = `${luckyURL.pathname}/${requestPath}`.replace(/\/+/g, '/')
  targetPath = targetPath.replace(prefixPath, '').replace(/^\/+/, '')
  
  const targetUrl = new URL(targetPath, luckyURL.origin)
  
  // Copy query parameters from the original request
  if (req.url.includes('?')) {
    const queryString = req.url.split('?')[1]
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value)
    })
  }

  // Prepare the request
  const requestOptions = {
    method: req.method,
    headers: {
      'Authorization': `Key ${LUCKY_API_KEY}`,
      'Content-Type': req.headers['content-type'] || 'application/json',
    },
  }

  // Copy other relevant headers
  const headersToForward = ['accept', 'accept-language', 'user-agent']
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
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  try {
    const response = await makeLuckyAppRequest(req)
    const data = await response.json()

    // Forward the status code
    res.status(response.status)
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return res.json(data)
  } catch (error) {
    console.error('LuckyLabs proxy error:', error)
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    })
  }
}

