// /api/klaviyo/newsletter-join.js
import axios from 'axios'

export default async function send(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Must be a POST request' })
  }

  const {
    body: { listID, email, fullname }
  } = req

  // Honeypot check
  if (fullname !== '') {
    console.warn('Honeypot triggered')
    return res.status(200).json({ status: 202 })
  }

  if (!email || !listID) {
    return res.status(400).json({ error: 'Missing email or list ID' })
  }

  try {
    const COMPANY_ID = process.env.KLAVIYO_COMPANY_ID
    if (!COMPANY_ID) {
      return res.status(500).json({ error: 'Missing Klaviyo Company ID' })
    }

    const payload = {
      data: {
        type: 'subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
                properties: {
                  $source: 'Footer Signup'
                }
              }
            }
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listID
            }
          }
        }
      }
    }

    const response = await axios.post(
      `https://a.klaviyo.com/client/subscriptions?company_id=${COMPANY_ID}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'revision': '2024-02-15'
        }
      }
    )

    return res.status(200).json({
      message: 'Profile subscribed via Subscriptions API',
      result: response.data
    })
  } catch (error) {
    console.error(
      'Klaviyo Subscription Error:',
      JSON.stringify(error.response?.data || error.message, null, 2)
    )
    return res.status(500).json({
      error: 'Failed to subscribe via Klaviyo',
      details: error.response?.data || error.message
    })
  }
}
