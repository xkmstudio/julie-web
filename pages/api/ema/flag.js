export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, messageId, tenant, flag } = req.body

  // Check for Ema API credentials
  const EMA_API_KEY = process.env.EMA_API_KEY
  const EMA_TENANT = process.env.EMA_TENANT

  if (!EMA_API_KEY || !EMA_TENANT) {
    return res.status(500).json({
      error: 'Ema API credentials not configured',
      message: 'Please set EMA_API_KEY and EMA_TENANT in your environment variables',
    })
  }

  // Validate required fields
  if (!userId || !messageId || !flag || !flag.value) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'userId, messageId, and flag.value are required',
    })
  }

  // Validate flag value
  if (flag.value !== 'good' && flag.value !== 'bad') {
    return res.status(400).json({
      error: 'Invalid flag value',
      message: 'flag.value must be either "good" or "bad"',
    })
  }

  const EMA_BASE_URL = 'https://api.emaapi.com'

  try {
    const response = await fetch(`${EMA_BASE_URL}/ema/messages/flag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMA_API_KEY}`,
      },
      body: JSON.stringify({
        userId: userId,
        messageId: messageId,
        tenant: tenant || EMA_TENANT,
        flag: {
          value: flag.value,
          reason: flag.reason || null,
          description: flag.description || null,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Ema API flag error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      return res.status(response.status).json({
        error: 'Failed to flag message',
        message: errorData.errors?.[0] || errorData.message || 'Failed to flag message',
        details: errorData,
      })
    }

    const result = await response.json()
    return res.status(200).json(result)
  } catch (error) {
    console.error('Ema API error:', error)
    return res.status(500).json({
      error: 'Error communicating with Ema API',
      message: error.message,
    })
  }
}

