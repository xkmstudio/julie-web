import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { algoliasearch } from 'algoliasearch';
import Image from 'next/image'

import { AnimatePresence, m } from 'framer-motion'

import { getStaticPage, queries } from '@data'

import { filterItems, FilterOption } from '@lib/filters-blog'

import { useInView } from 'react-intersection-observer'

import { useWindowSize, isBrowser } from '@lib/helpers'

import Layout from '@components/layout'
import Icon from '@components/icon'
import Photo from '@components/photo'
import BlockContent from '@components/block-content'

const Articles = ({ data }) => {
  const router = useRouter()
  const { site, page } = data

  const { articles } = page

  const [contentRef, inView] = useInView({ threshold: 0, triggerOnce: true })
  const [activeTags, setActiveTags] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef(null)

  // Initialize Algolia client
  // In Algolia v5, methods are called directly on the client with indexName parameter
  const algoliaClient = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
    ? algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
      )
    : null

  const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'

  // Read search query from URL on mount
  useEffect(() => {
    const query = router.query.search || router.query.q || ''
    if (query && typeof query === 'string') {
      setSearchQuery(query)
      performSearch(query)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.search, router.query.q])

  // Search function
  const performSearch = async (query) => {
    if (!query || !query.trim() || !algoliaClient) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      // In Algolia v5, use searchSingleIndex() directly on the client
      // Don't specify attributesToRetrieve - by default Algolia returns all attributes
      // unless they're in unretrievableAttributes
      const { hits } = await algoliaClient.searchSingleIndex({
        indexName: algoliaIndexName,
        searchParams: {
          query: query,
          hitsPerPage: 100,
          // Omit attributesToRetrieve to get all attributes by default
        },
      })
      
      // Debug: log raw hit structure - this is critical for debugging
      if (process.env.NODE_ENV === 'development' && hits.length > 0) {
        const firstHit = hits[0]
        console.log('=== Raw Algolia Hit Structure ===')
        console.log('Index Name:', algoliaIndexName)
        console.log('ObjectID:', firstHit.objectID)
        console.log('Title:', firstHit.title)
        console.log('Has image field:', 'image' in firstHit)
        console.log('Image value:', firstHit.image)
        console.log('Image type:', typeof firstHit.image)
        console.log('Image === null?', firstHit.image === null)
        console.log('Image === undefined?', firstHit.image === undefined)
        console.log('Has gradient field:', 'gradient' in firstHit)
        console.log('Gradient value:', firstHit.gradient)
        console.log('All top-level keys:', Object.keys(firstHit))
        
        // Try to get the object directly from Algolia to verify
        try {
          const directObject = await algoliaClient.getObject({
            indexName: algoliaIndexName,
            objectID: firstHit.objectID,
          })
          console.log('=== Direct Object from Algolia (getObject) ===')
          console.log('Image from getObject:', directObject.image)
          console.log('Gradient from getObject:', directObject.gradient)
          console.log('==============================================')
        } catch (error) {
          console.error('Could not fetch object directly:', error)
        }
        
        console.log('Full hit (first 2000 chars):', JSON.stringify(firstHit, null, 2).substring(0, 2000))
        console.log('=================================')
      }
      
      // Map Algolia results to match article structure
      // Image and gradient are objects with url, alt, lqip, etc.
      const mappedResults = hits.map((hit) => {
        return {
          slug: hit.slug,
          title: hit.title,
          subtitle: hit.subtitle,
          date: hit.date,
          tags: hit.tags || [],
          authors: hit.authors || [],
          // Image and gradient are objects (or null)
          image: hit.image || null,
          gradient: hit.gradient || null,
          useGradient: hit.useGradient || false,
        }
      })
      
      // Debug: log first result to see image structure
      if (mappedResults.length > 0 && process.env.NODE_ENV === 'development') {
        console.log('First search result image data:', {
          article: mappedResults[0].title,
          image: mappedResults[0].image,
          gradient: mappedResults[0].gradient,
          useGradient: mappedResults[0].useGradient,
          rawHitImage: hits[0]?.image,
          rawHitGradient: hits[0]?.gradient
        })
      }
      
      setSearchResults(mappedResults)
    } catch (error) {
      console.error('Algolia search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    
    if (query) {
      // Update URL with search parameter
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, search: query },
        },
        undefined,
        { shallow: true }
      )
      performSearch(query)
    } else {
      // Clear search
      const { search, q, ...restQuery } = router.query
      router.push(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true }
      )
      setSearchResults(null)
      setSearchQuery('')
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    const { search, q, ...restQuery } = router.query
    router.push(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    )
  }

  // Separate articles by useGradient
  const regularArticles = articles.filter((article) => !article.useGradient)
  const gradientArticles = articles.filter((article) => article.useGradient === true)

  //setup filters
  const tags = []

  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      if (tag.slug && !tags.find((t) => t.slug == tag.slug)) {
        tags.push({
          title: tag.title,
          slug: tag.slug,
        })
      }
    })
  })

  const filteredItems = filterItems(regularArticles, tags, 100)
  const allFilteredItems = filterItems(articles, tags, 100)

  // Check if filters are active by looking at the filter state
  const hasActiveFilters = filteredItems?.activeFilters[0]?.values?.length > 0

  useEffect(() => {
    setActiveTags(filteredItems?.activeFilters[0]?.values?.length || 0)
  }, [filteredItems])

  const featuredArticle = regularArticles[0]

  console.log(featuredArticle)

  return (
    <Layout site={site} page={page}>
      <div className="mb-60 md:mb-100">
        <Link
          className="block relative w-full h-[60rem] overflow-hidden"
          href={`/blog/${featuredArticle.slug}`}
        >
          <Photo
            photo={featuredArticle.image}
            width={1200}
            srcSizes={[800, 1000, 1200, 1600]}
            sizes="100%"
            layout={'fill'}
            className={'w-full h-full object-cover absolute top-0 left-0'}
          />
          <div className="absolute bottom-0 left-0 w-full text-white p-25 max-w-[80rem] flex flex-col gap-20">
            <div className="flex items-center gap-10">
              <div>by {featuredArticle.authors[0]?.title}</div>
              <div className="flex justify-center items-center gap-10 tag-role">
                {featuredArticle.authors[0]?.role}
              </div>
            </div>
            <h2 className="w-full title-2xl">{featuredArticle.title}</h2>
          </div>
        </Link>
        <div className="my-90 flex flex-col gap-40 items-center">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 md:gap-25">
            {tags && (
              <div className="flex gap-5 md:gap-10 flex-wrap md:items-center justify-start md:justify-end">
                <button
                  onClick={() => {
                    // Both use the same filter state, so update both
                    filteredItems.updateParams(
                      filteredItems.activeFilters.map((filter) => ({
                        name: filter.name,
                        value: null,
                      }))
                    )
                    allFilteredItems.updateParams(
                      allFilteredItems.activeFilters.map((filter) => ({
                        name: filter.name,
                        value: null,
                      }))
                    )
                  }}
                  className={`btn is-tag${!activeTags ? ' is-active' : ''}`}
                >
                  All
                </button>
                {tags?.map((tag, key) => {
                  return (
                    <FilterOption
                      className={`btn is-tag`}
                      key={key}
                      option={tag}
                      activeOptions={filteredItems.activeFilters.find(
                        (f) => f.name === 'tag'
                      )}
                      onChange={(params) => {
                        // Update both filter sets to keep them in sync
                        filteredItems.updateParams(params)
                        allFilteredItems.updateParams(params)
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full mt-40 mb-50 section-padding">
          <div className="w-full max-w-[80rem] mx-auto">
            <form onSubmit={handleSearchSubmit} className="w-full flex gap-10">
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles..."
                  className="w-full px-20 py-15 border-2 border-ash rounded-[1rem] focus:outline-none focus:border-pink transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-15 top-1/2 -translate-y-1/2 text-ash hover:text-black transition-colors"
                  >
                    <Icon name="Close" viewBox="0 0 24 24" className="w-20 h-20" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn px-30"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchResults !== null && (
              <div className="mt-20 text-14 text-ash">
                {searchResults.length > 0 ? (
                  <span>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                ) : (
                  <span>No results found</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-35 md:mt-50 gap-y-50 section-padding">
          <AnimatePresence mode="wait">
            {(() => {
              // When search is active, render search results as 1/3 width cards
              if (searchResults !== null) {
                return (
                  <div className="w-full grid grid-cols-12 gap-x-20 gap-y-50">
                    {searchResults.map((article, key) => {
                      // Image and gradient are objects with url, alt, lqip, etc.
                      const articleImage = article.useGradient ? article.gradient : article.image
                      
                      return (
                        <div key={key} className="col-span-12 md:col-span-4">
                          <Link
                            className="relative block"
                            href={`/blog/${article.slug}`}
                          >
                            <div className="w-full pb-[120%] relative rounded-[1rem] overflow-hidden">
                              {articleImage && articleImage.url ? (
                                <Image
                                  src={articleImage.url}
                                  alt={articleImage.alt || article.title || ''}
                                  fill
                                  className="w-full h-full object-cover absolute top-0 left-0"
                                  placeholder={articleImage.lqip ? 'blur' : 'empty'}
                                  blurDataURL={articleImage.lqip || undefined}
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full bg-ash/10 absolute top-0 left-0 flex items-center justify-center">
                                  <span className="text-ash text-14">No image</span>
                                </div>
                              )}
                              {article.tags?.[0] && (
                                <div className="tag is-card absolute top-10 left-10">
                                  {article.tags[0]?.title}
                                </div>
                              )}
                            </div>
                            <div className="mt-10 p-10 flex flex-col gap-10 items-center text-center">
                              <h2 className="w-full title-2xs max-w-[28rem]">
                                {article.title}
                              </h2>
                              {article.authors?.length > 0 && (
                                <div className="flex items-center flex-wrap gap-10 justify-center">
                                  <div className="flex justify-center items-center gap-3">
                                    <div>by</div>
                                    <div>
                                      <span className="underline font-lb">
                                        {article.authors[0].title}
                                      </span>
                                    </div>
                                  </div>
                                  {article.authors[0].role && (
                                    <div className="flex text-pink justify-center items-center gap-10 tag-role">
                                      {article.authors[0].role}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )
              }

              // When filters are active, render all articles as 1/3 width cards
              if (hasActiveFilters) {
                const allArticles = allFilteredItems?.paginatedItems || []
                return (
                  <div className="w-full grid grid-cols-12 gap-x-20 gap-y-50">
                    {allArticles.map((article, key) => {
                      // Image and gradient are now simple URL strings (from Sanity, not Algolia)
                      // For filtered view, use Photo component which expects asset object structure
                      const articleImage = article.useGradient ? article.gradient : article.image
                      
                      return (
                        <div key={key} className="col-span-12 md:col-span-4">
                          <Link
                            className="relative block"
                            href={`/blog/${article.slug}`}
                          >
                            <div className="w-full pb-[120%] relative rounded-[1rem] overflow-hidden">
                              {articleImage ? (
                                <Photo
                                  photo={articleImage}
                                  width={1200}
                                  srcSizes={[800, 1000, 1200, 1600]}
                                  sizes="100%"
                                  layout={'fill'}
                                  className={
                                    'w-full h-full object-cover absolute top-0 left-0'
                                  }
                                />
                              ) : (
                                <div className="w-full h-full bg-ash/10 absolute top-0 left-0 flex items-center justify-center">
                                  <span className="text-ash text-14">No image</span>
                                </div>
                              )}
                              {article.tags?.[0] && (
                                <div className="tag is-card absolute top-10 left-10">
                                  {article.tags[0]?.title}
                                </div>
                              )}
                            </div>
                            <div className="mt-10 p-10 flex flex-col gap-10 items-center text-center">
                              <h2 className="w-full title-2xs max-w-[28rem]">
                                {article.title}
                              </h2>
                              {article.authors?.length > 0 && (
                                <div className="flex items-center flex-wrap gap-10 justify-center">
                                  <div className="flex justify-center items-center gap-3">
                                    <div>by</div>
                                    <div>
                                      <span className="underline font-lb">
                                        {article.authors[0].title}
                                      </span>
                                    </div>
                                  </div>
                                  {article.authors[0].role && (
                                    <div className="flex text-pink justify-center items-center gap-10 tag-role">
                                      {article.authors[0].role}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )
              }

              // Default layout when no filters are active
              const items = []
              const articles = filteredItems?.paginatedItems || []
              
              for (let key = 0; key < articles.length; key++) {
                const article = articles[key]
                // Pattern: [1/2, 1/2] [1/3, 1/3, 1/3] [full] [1/3, 1/3, 1/3] [1/5, 1/5] [full]
                // Cycle length: 12 articles
                const cyclePosition = key % 12
                let colSpan = 'col-span-12'
                let isFullWidth = false
                let isOverlay = false
                let isOneFifth = false

                if (cyclePosition < 2) {
                  // First two: 1/2 width
                  colSpan = 'col-span-12 md:col-span-6'
                } else if (cyclePosition < 5) {
                  // Next three: 1/3 width
                  colSpan = 'col-span-12 md:col-span-4'
                } else if (cyclePosition === 5) {
                  // Next one: full width with overlay
                  colSpan = 'col-span-12'
                  isFullWidth = true
                  isOverlay = true
                } else if (cyclePosition < 9) {
                  // Next three: 1/3 width
                  colSpan = 'col-span-12 md:col-span-4'
                } else if (cyclePosition < 11) {
                  // Next two: 1/5 width
                  isOneFifth = true
                } else {
                  // Next one: full width with overlay
                  colSpan = 'col-span-12'
                  isFullWidth = true
                  isOverlay = true
                }

                // Handle 1/5 width items with a flex container
                if (isOneFifth && cyclePosition === 9) {
                  // Start of 1/5 pair - create flex container that spans full width
                  const nextArticle = articles[key + 1]
                  items.push(
                    <div key={key} className="col-span-12 w-full flex gap-x-20 gap-y-50">
                      {/* First 1/5 item */}
                      <div className="w-full md:w-[20%]">
                        <Link
                          className="relative block"
                          href={`/blog/${article.slug}`}
                        >
                          <div className="w-full pb-[120%] relative rounded-[1rem] overflow-hidden">
                            <Photo
                              photo={article.image}
                              width={1200}
                              srcSizes={[800, 1000, 1200, 1600]}
                              sizes="100%"
                              layout={'fill'}
                              className={
                                'w-full h-full object-cover absolute top-0 left-0'
                              }
                            />
                            {article.tags?.[0] && (
                              <div className="tag is-card absolute top-10 left-10">
                                {article.tags[0]?.title}
                              </div>
                            )}
                          </div>
                          <div className="mt-10 p-10 flex flex-col gap-10 items-center text-center">
                            <h2 className="w-full title-2xs max-w-[28rem]">
                              {article.title}
                            </h2>
                            {article.authors?.length > 0 && (
                              <div className="flex items-center flex-wrap gap-10 justify-center">
                                <div className="flex justify-center items-center gap-3">
                                  <div>by</div>
                                  <div>
                                    <span className="underline font-lb">
                                      {article.authors[0].title}
                                    </span>
                                  </div>
                                </div>
                                {article.authors[0].role && (
                                  <div className="flex text-pink justify-center items-center gap-10 tag-role">
                                    {article.authors[0].role}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                      {/* Second 1/5 item */}
                      {nextArticle && (
                        <div className="w-full md:w-[20%]">
                          <Link
                            className="relative block"
                            href={`/blog/${nextArticle.slug}`}
                          >
                            <div className="w-full pb-[120%] relative rounded-[1rem] overflow-hidden">
                              <Photo
                                photo={nextArticle.image}
                                width={1200}
                                srcSizes={[800, 1000, 1200, 1600]}
                                sizes="100%"
                                layout={'fill'}
                                className={
                                  'w-full h-full object-cover absolute top-0 left-0'
                                }
                              />
                              {nextArticle.tags?.[0] && (
                                <div className="tag is-card absolute top-10 left-10">
                                  {nextArticle.tags[0]?.title}
                                </div>
                              )}
                            </div>
                            <div className="mt-10 p-10 flex flex-col gap-10 items-center text-center">
                              <h2 className="w-full title-2xs max-w-[28rem]">
                                {nextArticle.title}
                              </h2>
                              {nextArticle.authors?.length > 0 && (
                                <div className="flex items-center flex-wrap gap-10 justify-center">
                                  <div className="flex justify-center items-center gap-3">
                                    <div>by</div>
                                    <div>
                                      <span className="underline font-lb">
                                        {nextArticle.authors[0].title}
                                      </span>
                                    </div>
                                  </div>
                                  {nextArticle.authors[0].role && (
                                    <div className="flex text-pink justify-center items-center gap-10 tag-role">
                                      {nextArticle.authors[0].role}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                  // Skip the next item since we already rendered it
                  key++
                  continue
                } else if (isOneFifth && cyclePosition === 10) {
                  // Skip this item - it was already rendered in the previous iteration
                  continue
                }

                if (isOverlay) {
                  items.push(
                    <div key={key} className={colSpan}>
                      <Link
                        className="block relative w-full h-[60rem] overflow-hidden rounded-[1rem]"
                        href={`/blog/${article.slug}`}
                      >
                        <Photo
                          photo={article.image}
                          width={1200}
                          srcSizes={[800, 1000, 1200, 1600]}
                          sizes="100%"
                          layout={'fill'}
                          className={'w-full h-full object-cover absolute top-0 left-0'}
                        />
                        <div className="absolute bottom-0 left-0 w-full text-white p-25 max-w-[80rem] flex flex-col gap-20">
                          <div className="flex items-center gap-10">
                            <div>by {article.authors[0]?.title}</div>
                            <div className="flex justify-center items-center gap-10 tag-role">
                              {article.authors[0]?.role}
                            </div>
                          </div>
                          <h2 className="w-full title-2xl">{article.title}</h2>
                        </div>
                      </Link>
                    </div>
                  )
                  continue
                }

                // Use square ratio for 50% width articles (first two in cycle)
                const aspectRatio = cyclePosition < 2 ? 'pb-[100%]' : 'pb-[120%]'
                
                items.push(
                  <div key={key} className={colSpan}>
                    <Link
                      className="relative block"
                      href={`/blog/${article.slug}`}
                    >
                      <div className={`w-full ${aspectRatio} relative rounded-[1rem] overflow-hidden`}>
                        <Photo
                          photo={article.image}
                          width={1200}
                          srcSizes={[800, 1000, 1200, 1600]}
                          sizes="100%"
                          layout={'fill'}
                          className={
                            'w-full h-full object-cover absolute top-0 left-0'
                          }
                        />
                        {article.tags?.[0] && (
                          <div className="tag is-card absolute top-10 left-10">
                            {typeof article.tags[0] === 'string' 
                              ? article.tags[0] 
                              : article.tags[0]?.title || article.tags[0]}
                          </div>
                        )}
                      </div>
                      <div className="mt-10 p-10 flex flex-col gap-10 items-center text-center">
                        <h2 className="w-full title-2xs max-w-[28rem]">
                          {article.title}
                        </h2>
                        {article.authors?.length > 0 && (
                          <div className="flex items-center flex-wrap gap-10 justify-center">
                            <div className="flex justify-center items-center gap-3">
                              <div>by</div>
                              <div>
                                <span className="underline font-lb">
                                  {article.authors[0].title}
                                </span>
                              </div>
                            </div>
                            {article.authors[0].role && (
                              <div className="flex text-pink justify-center items-center gap-10 tag-role">
                                {article.authors[0].role}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                )
              }
              
              return (
                <div className="w-full grid grid-cols-12 gap-x-20 gap-y-50">
                  {items}
                </div>
              )
            })()}
          </AnimatePresence>
        </div>

        {/* Gradient Articles List - only show when no filters are active */}
        {!hasActiveFilters && gradientArticles.length > 0 && (
          <div className="w-full mt-90 section-padding">
            <div className="w-full mx-auto border-t-2 border-ash">
              <div className="w-full flex flex-col gap-0">
                {gradientArticles.map((article, key) => (
                  <Link
                    key={key}
                    href={`/blog/${article.slug}`}
                    className="group w-full flex items-end justify-between py-20 border-b-2 border-ash hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 flex flex-col gap-10">
                      <div className="font-lb">
                        by {article.authors[0]?.title}
                      </div>
                      <h3 className="title-lg font-bold">
                        {article.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end gap-15">
                      <div className='text-ash transition-colors duration-300 group-hover:text-black'>
                        <Icon name="Arrow Out" viewBox="0 0 18 18" className="w-16 h-16" />
                      </div>
                      {article.tags?.[0] && (
                        <div className="tag">
                          {article.tags[0].title}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticProps({ preview, previewData }) {
  const pageData = await getStaticPage(
    `
    *[_type == "blog"][0]{
      title,
      subtitle,
      description[]{${queries.ptContent}},
      image{${queries.assetMeta}},
      background{${queries.assetMeta}},
      "articles": *[_type == "article" && defined(date)] | order(date desc){
        'slug': slug.current, 
        authors[]->{
          title,
          'slug': slug.current,
          image{${queries.assetMeta}},
          role,
        },
        title, 
        subtitle,
        date,
        image{${queries.assetMeta}},
        gradient{${queries.assetMeta}},
        tags[]->{'slug': slug.current, title},
        useGradient
      },
      seo,
    }
  `,
    {
      active: preview,
      token: previewData?.token,
    }
  )

  return {
    props: {
      data: pageData,
    },
  }
}

export default Articles
