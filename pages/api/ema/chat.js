// Ensure body parsing is enabled (default, but explicit for Netlify compatibility)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Disable caching for API routes to ensure fresh data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for Ema API credentials first
  const EMA_API_KEY = process.env.EMA_API_KEY
  const EMA_TENANT = process.env.EMA_TENANT

  if (!EMA_API_KEY || !EMA_TENANT) {
    console.error('EMA API credentials missing:', {
      hasApiKey: !!EMA_API_KEY,
      hasTenant: !!EMA_TENANT,
      envKeys: Object.keys(process.env).filter(key => key.includes('EMA')),
      nodeEnv: process.env.NODE_ENV,
      context: process.env.CONTEXT,
    })
    return res.status(500).json({
      error: 'Ema API credentials not configured',
      message: 'Please set EMA_API_KEY and EMA_TENANT in your environment variables',
      debug: process.env.NODE_ENV === 'development' ? {
        hasApiKey: !!EMA_API_KEY,
        hasTenant: !!EMA_TENANT,
      } : undefined,
    })
  }

  // Always log errors, but only log full request details in debug mode
  const isDebug = process.env.NODE_ENV !== 'production' || process.env.DEBUG_EMA === 'true'
  
  // Log request details for debugging
  if (isDebug) {
    console.log('EMA Chat API Request:', {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        origin: req.headers['origin'],
      },
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
      hasBody: !!req.body,
      bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : 'N/A',
    })
  }

  // Parse request body - handle different formats (Netlify, Vercel, local)
  let body
  try {
    // Handle case where body might be undefined or empty
    if (!req.body) {
      console.error('Request body is undefined:', {
        body: req.body,
        bodyType: typeof req.body,
        headers: req.headers,
      })
      return res.status(400).json({
        error: 'Request body is required',
        message: 'Request must include a JSON body with an "action" field',
      })
    }
    
    // Check if body is an empty object (but allow it if it's intentionally empty for some actions)
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body) && Object.keys(req.body).length === 0) {
      console.error('Request body is an empty object:', {
        body: req.body,
        bodyType: typeof req.body,
      })
      return res.status(400).json({
        error: 'Request body cannot be empty',
        message: 'Request must include a JSON body with an "action" field',
      })
    }

    // Handle Buffer (Netlify sometimes sends as Buffer)
    if (Buffer.isBuffer(req.body)) {
      body = JSON.parse(req.body.toString('utf8'))
    }
    // Handle string
    else if (typeof req.body === 'string') {
      body = JSON.parse(req.body)
    }
    // Handle already parsed object (Next.js default behavior)
    else if (typeof req.body === 'object') {
      body = req.body
    }
    // Fallback: try to parse as string
    else {
      body = JSON.parse(String(req.body))
    }
  } catch (e) {
    console.error('Error parsing request body:', {
      error: e.message,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
      bodyPreview: typeof req.body === 'string' 
        ? req.body.substring(0, 100) 
        : JSON.stringify(req.body).substring(0, 100),
    })
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      message: e.message,
    })
  }

  const { action, userId, message, context } = body || {}

  // Validate request body
  if (!action) {
    console.error('Missing action in request body:', {
      body,
      hasAction: !!action,
      hasUserId: !!userId,
      hasMessage: !!message,
    })
    return res.status(400).json({
      error: 'Missing required field: action',
      message: 'Request must include an "action" field (either "createUser" or "sendMessage")',
      received: Object.keys(body || {}),
    })
  }

  const EMA_BASE_URL = 'https://api.emaapi.com'

  try {
    if (action === 'createUser') {
      // Create a new user session
      const response = await fetch(`${EMA_BASE_URL}/ema/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EMA_API_KEY}`,
        },
        body: JSON.stringify({
          tenant: EMA_TENANT,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return res.status(response.status).json({
          error: 'Failed to create user session',
          details: errorData,
        })
      }

      const userData = await response.json()
      return res.status(200).json(userData)
    } else if (action === 'sendMessage') {
      // Send message with streaming response
      if (!userId || !message) {
        return res.status(400).json({
          error: 'userId and message are required',
        })
      }

      // Set up SSE headers for streaming
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('X-Accel-Buffering', 'no') // Disable buffering for nginx

      // Forward the request to Ema API with streaming
      const emaResponse = await fetch(`${EMA_BASE_URL}/ema/live-talk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EMA_API_KEY}`,
        },
        body: JSON.stringify({
          tenant: EMA_TENANT,
          userId: userId,
          message: message,
          context: context || null,
        }),
      })

      if (!emaResponse.ok) {
        const errorData = await emaResponse.json().catch(() => ({}))
        res.write(`data: ${JSON.stringify({ error: true, message: 'Failed to send message', details: errorData, statusCode: emaResponse.status })}\n\n`)
        res.end()
        return
      }

      // Stream the response from Ema API to the client
      const reader = emaResponse.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Forward the chunk to the client
          res.write(chunk)

          // Flush the response to ensure streaming works
          if (typeof res.flush === 'function') {
            res.flush()
          }
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError)
        res.write(`data: ${JSON.stringify({ error: true, message: 'Streaming error occurred' })}\n\n`)
      } finally {
        res.end()
      }

      return
    } else {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Action must be "createUser" or "sendMessage"',
      })
    }
  } catch (error) {
    console.error('Ema API error:', error)
    return res.status(500).json({
      error: 'Error communicating with Ema API',
      message: error.message,
    })
  }
}

