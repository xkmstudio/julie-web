import axios from 'axios'

export default async function send(req, res) {
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'must be a POST request' })
  }

  const {
    body: { fullname, code },
  } = req

  if (req.method === 'POST') {
    // Set the Authorization header with the access token
    const headers = {
      'Content-Type': 'application/json',
    }

    const productId = 45070592246079

    //update phone
    axios
    .get('https://preproduct.onrender.com/api/preproducts/' + productId + '.json', {
      headers,
    })
    .then((response) => {
        res.status(200).json({ success: response });
    })
    .catch((error) => {
      res.status(500).json({ error: `Error checking coupon code` });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
