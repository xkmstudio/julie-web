import { getPage, getArticle, getProduct, getProfile, getCollection } from '@data'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Parse URL safely for both absolute and relative URLs
    const parsedUrl = new URL(url, 'https://juliecare.co')
    // Remove leading/trailing slashes
    let pathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')

    // Determine content type based on pathname
    const isArticle = pathname.startsWith('blog/')
    const isProduct = pathname.startsWith('products/')
    const isProfile = pathname.startsWith('profiles/')
    const isCollection = pathname.startsWith('collections/')
    const isPageRoute = pathname.startsWith('pages/')
    
    let data = null
    let contentType = 'page'

    if (isArticle) {
      // Fetch article
      const slug = pathname.replace('blog/', '')
      data = await getArticle(slug, { active: false })
      contentType = 'article'
    } else if (isProduct) {
      // Fetch product
      const slug = pathname.replace('products/', '')
      data = await getProduct(slug, { active: false })
      contentType = 'product'
    } else if (isProfile) {
      // Fetch profile
      const slug = pathname.replace('profiles/', '')
      data = await getProfile(slug, { active: false })
      contentType = 'profile'
    } else if (isCollection) {
      // Fetch collection
      const slug = pathname.replace('collections/', '')
      data = await getCollection(slug, { active: false })
      contentType = 'collection'
    } else if (isPageRoute) {
      // Fetch dynamic pages route (/pages/[...slug])
      const slug = pathname.replace('pages/', '')
      data = await getPage(slug, { active: false })
      contentType = 'page'
    } else {
      // Fetch regular page
      // Empty string maps to homepage slugs in getPage
      data = await getPage(pathname, { active: false })
      contentType = 'page'
    }

    if (!data || !data.page) {
      return res.status(404).json({ error: 'Page not found' })
    }

    return res.status(200).json({
      data,
      type: contentType,
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return res.status(500).json({ error: 'Failed to fetch content' })
  }
}

