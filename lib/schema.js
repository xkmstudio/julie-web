import { centsToPrice } from '@lib/helpers'

function textFromPortableText(blocks = []) {
  if (!Array.isArray(blocks)) return ''

  return blocks
    .map((block) => {
      if (!block) return ''
      if (typeof block === 'string') return block

      if (Array.isArray(block.children)) {
        return block.children
          .map((child) =>
            child && typeof child.text === 'string' ? child.text : ''
          )
          .join('')
      }

      return ''
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUrl(rootDomain, path = '') {
  const safeRoot = (rootDomain || 'https://juliecare.co').replace(/\/$/, '')
  const safePath = path ? path.split('?')[0] : ''
  return `${safeRoot}${safePath}`
}

function formatSchemaPrice(cents) {
  const numeric = Number(cents)
  if (!Number.isFinite(numeric)) return null
  return (numeric / 100).toFixed(2)
}

export function buildFaqSchemaFromModules(modules = [], pageUrl) {
  if (!Array.isArray(modules) || modules.length === 0) return null

  const questions = modules
    .filter((module) => module?._type === 'faqs' || module?._type === 'productFaqs')
    .flatMap((module) => module.sections || [])
    .flatMap((section) => section.drawers || [])
    .map((drawer) => ({
      question: drawer?.title?.trim(),
      answer: textFromPortableText(drawer?.content),
    }))
    .filter((entry) => entry.question && entry.answer)
    .map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    }))

  if (questions.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
    url: pageUrl,
  }
}

export function buildProductSchema({
  product,
  activeVariantID,
  site,
  currentPath,
}) {
  if (!product) return null

  const variant = product.variants?.find((v) => v.id == activeVariantID)
  const selectedPrice = variant?.price ?? product.price ?? product.variants?.[0]?.price
  const selectedSku = variant?.sku ?? product.sku
  const selectedInStock = Boolean(variant?.inStock ?? product.inStock)
  const pageUrl = normalizeUrl(site?.rootDomain, currentPath)
  const description = textFromPortableText(product.description)
  const schemaPrice = formatSchemaPrice(selectedPrice)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: description || undefined,
    sku: selectedSku || undefined,
    brand: {
      '@type': 'Brand',
      name: site?.title || 'JULIE',
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      availability: `https://schema.org/${selectedInStock ? 'InStock' : 'SoldOut'}`,
      price: schemaPrice || centsToPrice(selectedPrice ?? 0),
      priceCurrency: 'USD',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}

export function buildArticleSchema({ page, site, currentPath }) {
  if (!page) return null

  const pageUrl = normalizeUrl(site?.rootDomain, currentPath)
  const published = page.date || page._createdAt
  const modified = page._updatedAt || page.date || page._createdAt

  if (!published && !modified) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    url: pageUrl,
    datePublished: published,
    dateModified: modified,
    author: (page.authors || []).map((author) => ({
      '@type': 'Person',
      name: author?.title,
      url: author?.slug ? normalizeUrl(site?.rootDomain, `/profiles/${author.slug}`) : undefined,
    })),
  }
}

export function buildPageSchemas({
  modules = [],
  site,
  currentPath,
  product,
  activeVariantID,
}) {
  const pageUrl = normalizeUrl(site?.rootDomain, currentPath)
  const schemas = []

  if (product) {
    const productSchema = buildProductSchema({
      product,
      activeVariantID,
      site,
      currentPath,
    })
    if (productSchema) schemas.push(productSchema)
  }

  const faqSchema = buildFaqSchemaFromModules(modules, pageUrl)
  if (faqSchema) schemas.push(faqSchema)

  if (schemas.length === 0) return null
  return schemas.length === 1 ? schemas[0] : schemas
}
