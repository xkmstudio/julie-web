export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, userId, message, context } = req.body

  // Check for Ema API credentials
  const EMA_API_KEY = process.env.EMA_API_KEY
  const EMA_TENANT = process.env.EMA_TENANT

  if (!EMA_API_KEY || !EMA_TENANT) {
    return res.status(500).json({
      error: 'Ema API credentials not configured',
      message: 'Please set EMA_API_KEY and EMA_TENANT in your environment variables',
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

