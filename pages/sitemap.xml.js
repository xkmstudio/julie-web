import groq from 'groq'
import { createClient } from '@sanity/client'

const DEFAULT_SITE_ROOT = 'https://juliecare.co'

const client = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET || 'production',
  projectId: process.env.SANITY_PROJECT_ID || '3gqwcxz3',
  useCdn: false,
  apiVersion: '2021-03-25',
})

const siteSettingsQuery = groq`*[_type == "generalSettings"][0]{
  "siteURL": siteURL,
  "homePageId": home->_id
}`

const pagesQuery = groq`*[
  _type == "page" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "_id": _id,
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const faqPagesQuery = groq`*[
  _type == "page" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current) &&
  (
    count(modules[_type == "faqs"]) > 0 ||
    count(modules[]->content[0][_type == "faqs"]) > 0
  )
]{
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const articlesQuery = groq`*[
  _type == "article" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current) &&
  defined(date)
]{
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const productsQuery = groq`*[
  _type == "product" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const profilesQuery = groq`*[
  _type == "profile" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const collectionsQuery = groq`*[
  _type == "collection" &&
  wasDeleted != true &&
  isDraft != true &&
  defined(slug.current)
]{
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

function sanitizeSlug(slug = '') {
  return slug.startsWith('/') ? slug.slice(1) : slug
}

function toLastMod(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function buildUrlEntry({ url, priority, lastmod }) {
  const lastModTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${url}</loc>${lastModTag}
    <priority>${priority}</priority>
  </url>`
}

async function buildSitemapXml() {
  const [siteSettings, pages, faqPages, articles, products, profiles, collections] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(pagesQuery),
    client.fetch(faqPagesQuery),
    client.fetch(articlesQuery),
    client.fetch(productsQuery),
    client.fetch(profilesQuery),
    client.fetch(collectionsQuery),
  ])

  const configuredSiteUrl = siteSettings?.siteURL
  const siteRoot =
    configuredSiteUrl && !configuredSiteUrl.includes('netlify.app')
      ? configuredSiteUrl.replace(/\/$/, '')
      : DEFAULT_SITE_ROOT

  const homePageId = siteSettings?.homePageId
  const pagesExcludingHome = homePageId
    ? pages.filter((page) => page._id !== homePageId)
    : pages

  const urls = [
    { url: `${siteRoot}/`, priority: '1.0', lastmod: null },
    { url: `${siteRoot}/blog`, priority: '0.8', lastmod: null },
    { url: `${siteRoot}/collections`, priority: '0.8', lastmod: null },
    ...pagesExcludingHome.map((page) => ({
      url: `${siteRoot}/pages/${sanitizeSlug(page.slug)}`,
      priority: '0.7',
      lastmod: toLastMod(page._updatedAt),
    })),
    ...faqPages.map((page) => ({
      url: `${siteRoot}/pages/${sanitizeSlug(page.slug)}`,
      priority: '0.8',
      lastmod: toLastMod(page._updatedAt),
    })),
    ...articles.map((article) => ({
      url: `${siteRoot}/blog/${sanitizeSlug(article.slug)}`,
      priority: '0.8',
      lastmod: toLastMod(article._updatedAt),
    })),
    ...products.map((product) => ({
      url: `${siteRoot}/products/${sanitizeSlug(product.slug)}`,
      priority: '0.8',
      lastmod: toLastMod(product._updatedAt),
    })),
    ...profiles.map((profile) => ({
      url: `${siteRoot}/profiles/${sanitizeSlug(profile.slug)}`,
      priority: '0.6',
      lastmod: toLastMod(profile._updatedAt),
    })),
    ...collections.map((collection) => ({
      url: `${siteRoot}/collections/${sanitizeSlug(collection.slug)}`,
      priority: '0.7',
      lastmod: toLastMod(collection._updatedAt),
    })),
  ]

  const uniqueUrls = Array.from(
    new Map(urls.map((entry) => [entry.url, entry])).values()
  )

  const urlEntries = uniqueUrls.map((entry) => buildUrlEntry(entry)).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

const SitemapXml = () => null

export async function getServerSideProps({ res }) {
  const sitemapXml = await buildSitemapXml()
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.write(sitemapXml)
  res.end()

  return { props: {} }
}

export default SitemapXml
