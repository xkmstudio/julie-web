import axios from 'axios'

export default async function send(req, res) {
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'must be a POST request' })
  }

  const {
    body: { slug, title },
  } = req

  if (req.method === 'POST') {
    const personalAccessToken = process.env.AIRTABLE_API_KEY
    const baseId = 'appWoX3DWoLRO2WvO'
    const tableName = 'tbloS0bF55ud9810S'

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`

    // Create the request payload
    const payload = {
      fields: {
        Slug: slug,
        Date: new Date(),
        Title: title
      },
    }

    // Set the Authorization header with the access token
    const headers = {
      Authorization: `Bearer ${personalAccessToken}`,
      'Content-Type': 'application/json',
    }

    // const filterByFormula = `SEARCH("${email}", {Email}) != ''`

    //update email
    axios
      .post(url, payload, { headers })
      .then((response) => {
        res.status(200).json(response.data)
      })
      .catch((error) => {
        res.status(500).json({ error: 'Error creating record' })
      })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
