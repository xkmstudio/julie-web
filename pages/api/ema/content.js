import { getPage, getArticle } from '@data'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Parse URL to get pathname
    let pathname = url
    if (url.startsWith('http')) {
      const urlObj = new URL(url)
      pathname = urlObj.pathname
    }

    // Remove leading/trailing slashes
    pathname = pathname.replace(/^\/+|\/+$/g, '')

    // Determine if it's a blog article or regular page
    const isArticle = pathname.startsWith('blog/')
    const slug = isArticle ? pathname.replace('blog/', '') : pathname

    let data = null

    if (isArticle) {
      // Fetch article
      data = await getArticle(slug, { active: false })
    } else {
      // Fetch page
      data = await getPage(pathname || '/', { active: false })
    }

    if (!data || !data.page) {
      return res.status(404).json({ error: 'Page not found' })
    }

    return res.status(200).json({
      data,
      type: isArticle ? 'article' : 'page',
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return res.status(500).json({ error: 'Failed to fetch content' })
  }
}

