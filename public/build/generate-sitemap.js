const groq = require('groq')

const fs = require('fs')
const path = require('path')

const {createClient} = require('@sanity/client')
const client = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET || 'production',
  projectId: process.env.SANITY_PROJECT_ID || '3gqwcxz3',
  useCdn: true,
  apiVersion: '2021-03-25',
})

const SITEMAP_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')

//
// === Queries ===
//

// Query for site settings (to get site URL and home page ID)
const siteSettingsQuery = groq`*[_type == "generalSettings"][0]{
  "siteURL": siteURL,
  "homePageId": home->_id
}`

// Query for pages (dynamic pages under /pages/[...slug])
// We'll exclude the home page in JavaScript after fetching
const pagesQuery = groq`*[
  _type == "page" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "_id": _id,
  "slug": slug.current
}`

// Query for articles (blog posts under /blog/[slug])
const articlesQuery = groq`*[
  _type == "article" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current) &&
  defined(date)
]{
  "slug": slug.current
}`

// Query for products (under /products/[slug])
const productsQuery = groq`*[
  _type == "product" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current
}`

// Query for profiles (under /profiles/[slug])
const profilesQuery = groq`*[
  _type == "profile" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current
}`

// Query for collections (shop collections under /collections/[slug])
const collectionsQuery = groq`*[
  _type == "collection" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current
}`

//
// === BUILD ===
//
const generateSitemap = async () => {
  try {
    console.log('Fetching content from Sanity...')
    
    const [siteSettings, pages, articles, products, profiles, collections] = await Promise.all([
      client.fetch(siteSettingsQuery),
      client.fetch(pagesQuery),
      client.fetch(articlesQuery),
      client.fetch(productsQuery),
      client.fetch(profilesQuery),
      client.fetch(collectionsQuery),
    ])

    // Get site root URL, fallback to hardcoded value
    const SITE_ROOT = siteSettings?.siteURL || 'https://juliecare.co'
    const homePageId = siteSettings?.homePageId
    
    // Filter out the home page from pages (it's served at /, not /pages/)
    const pagesExcludingHome = homePageId 
      ? pages.filter(page => page._id !== homePageId)
      : pages
    
    console.log(`Using site URL: ${SITE_ROOT}`)
    console.log(`Found ${pagesExcludingHome.length} pages (excluding home), ${articles.length} articles, ${products.length} products, ${profiles.length} profiles, ${collections.length} collections`)

    // Static pages
    const staticPages = [
      { url: `${SITE_ROOT}/`, priority: '1.0' }, // Homepage
      { url: `${SITE_ROOT}/blog`, priority: '0.8' }, // Blog index
      { url: `${SITE_ROOT}/collections`, priority: '0.8' }, // Shop index
    ]

    // Dynamic pages - handle nested slugs for pages
    const pagesLocations = pagesExcludingHome.map(page => {
      const slug = page.slug.startsWith('/') ? page.slug.slice(1) : page.slug
      return {
        url: `${SITE_ROOT}/pages/${slug}`,
        priority: '0.7'
      }
    })

    // Articles
    const articlesLocations = articles.map(article => ({
      url: `${SITE_ROOT}/blog/${article.slug}`,
      priority: '0.8'
    }))

    // Products
    const productsLocations = products.map(product => ({
      url: `${SITE_ROOT}/products/${product.slug}`,
      priority: '0.8'
    }))

    // Profiles
    const profilesLocations = profiles.map(profile => ({
      url: `${SITE_ROOT}/profiles/${profile.slug}`,
      priority: '0.6'
    }))

    // Collections
    const collectionsLocations = collections.map(collection => ({
      url: `${SITE_ROOT}/collections/${collection.slug}`,
      priority: '0.7'
    }))

    // Combine all URLs
    const allUrls = [
      ...staticPages,
      ...pagesLocations,
      ...articlesLocations,
      ...productsLocations,
      ...profilesLocations,
      ...collectionsLocations,
    ]

    // Generate XML
    const urlEntries = allUrls.map(({ url, priority }) => 
      `  <url>
    <loc>${url}</loc>
    <priority>${priority}</priority>
  </url>`
    ).join('\n')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

    fs.writeFileSync(SITEMAP_PATH, sitemap)
    console.log(`✅ Sitemap generated successfully with ${allUrls.length} URLs`)
    console.log(`   Saved to: ${SITEMAP_PATH}`)
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

generateSitemap()