import { algoliasearch } from 'algoliasearch'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query } = req.body

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' })
  }

  // Check for Algolia credentials
  if (
    !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ||
    !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  ) {
    return res.status(500).json({ error: 'Algolia credentials not configured' })
  }

  try {
    // Initialize Algolia client
    const algoliaClient = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
    )

    const algoliaIndexName =
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'

    // Search Algolia - simple, clean implementation
    const { hits } = await algoliaClient.searchSingleIndex({
      indexName: algoliaIndexName,
      searchParams: {
        query: query.trim(),
        hitsPerPage: 10,
      },
    })

    // Map Algolia results to match article structure
    const mappedResults = hits.map((hit) => {
      return {
        slug: hit.slug,
        title: hit.title,
        subtitle: hit.subtitle || '',
        date: hit.date,
        tags: hit.tags || [],
        authors: hit.authors || [],
        image: hit.image || null,
        gradient: hit.gradient || null,
        useGradient: hit.useGradient || false,
      }
    })

    return res.status(200).json({
      hits: mappedResults,
      total: mappedResults.length,
    })
  } catch (error) {
    console.error('Algolia search error:', error)
    return res.status(500).json({
      error: 'Error searching articles',
      message: error.message,
    })
  }
}

