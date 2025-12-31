import { getSanityClient } from '@lib/sanity'
import * as queries from './queries'

// Fetch all dynamic docs
export async function getAllDocSlugs(doc) {
  const data = await getSanityClient().fetch(
    `*[_type == "${doc}" && wasDeleted != true && isDraft != true]{ "slug": slug.current }`
  )
  return data
}

// Fetch all our page redirects
export async function getAllRedirects() {
  const data = await getSanityClient().fetch(
    `*[_type == "redirect"]{ from, to }`
  )
  return data
}

// Fetch a static page with our global data
export async function getStaticPage(pageData, preview) {
  const query = `
  {
    "page": ${pageData},
    ${queries.site}
  }
  `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch a specific product with our global data
export async function getProduct(slug, preview) {
  const query = `
    {
      "page": *[_type == "product" && slug.current == "${slug}" && wasDeleted != true && isDraft != true] | order(_updatedAt desc)[0]{
        "id": _id,
        "modules": contentModules[]{
          defined(_ref) => { ...@->content[0] {
            ${queries.modules}
          }},
          !defined(_ref) => {
            ${queries.modules},
          }
        },
        "product": {
          ${queries.product}
        },
        title,
        seo
      },
      ${queries.site}
    }
  `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch a specific collection with our global data
export async function getCollection(slug, preview) {
  const query = `
    {
      "page": *[_type == "collection" && slug.current == "${slug}" && isDraft != true] | order(_updatedAt desc)[0]{
        'modules': contentModules[]{
          ${queries.modules}
        },
        hero{${queries.mediaContent}},
        products[]->{${queries.product}},
        title,
        type,
        seo
      },
      ${queries.site}
    }
  `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch a specific dynamic project with our global data
export async function getPage(slug, preview) {
  const slugs = [`/${slug}`, slug, `/${slug}/`]

  const query = `
    {
      "page": *[_type == "page" && slug.current in ${JSON.stringify(
        slugs
      )}] | order(_updatedAt desc)[0]{
        padding,
        modules[]{
          defined(_ref) => { ...@->content[0] {
            ${queries.modules}
          }},
          !defined(_ref) => {
            ${queries.modules},
          }
        },
        title,
        seo,
      },
      ${queries.site},
    }
    `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch a specific dynamic article with our global data
export async function getArticle(slug, preview) {
  const slugs = [`/${slug}`, slug, `/${slug}/`]

  const query = `
    {
      "page": *[_type == "article" && slug.current in ${JSON.stringify(
        slugs
      )}] | order(date desc)[0]{
        _type,
        title,
        subtitle,
        'slug': slug.current,
        date,
        content[]{${queries.ptContent}},
        image{${queries.assetMeta}},
        'tag': tags[0]->{'slug': slug.current, title},
        summary[]{${queries.ptContent}},
        excerpt[]{${queries.ptContent}},
        useGradient,
        gradient{${queries.gradient}},
        authors[]->{
          title,
          'slug': slug.current,
          image{${queries.assetMeta}},
          role,
          bio[]{${queries.ptContent}},
        },
        reviewers[]->{
          title,
          'slug': slug.current,
          image{${queries.assetMeta}},
          role,
          bio[]{${queries.ptContent}},
        },
        modules[]{
          defined(_ref) => { ...@->content[0] {
            ${queries.modules}
          }},
          !defined(_ref) => {
            ${queries.modules},
          }
        },
        related[]->{
          title,
          'slug': slug.current,
          excerpt[]{${queries.ptContent}},
          'image': image{${queries.assetMeta}},
          gradient{${queries.gradient}},
          useGradient,
          tags[0]->{'slug': slug.current, title},
          authors[]->{
            title,
            'slug': slug.current,
            image{${queries.assetMeta}},
            role,
            bio[]{${queries.ptContent}},
          },
        },
        seo
      },
      ${queries.site},
    }
    `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch a specific dynamic article with our global data
export async function getProfile(slug, preview) {
  const slugs = [`/${slug}`, slug, `/${slug}/`]

  const query = `
    {
      "page": *[_type == "profile" && slug.current in ${JSON.stringify(
        slugs
      )}] | order(_updatedAt desc)[0]{
        _type,
        title,
        'slug': slug.current,
        image{${queries.assetMeta}},
        role,
        bio[]{${queries.ptContent}},
        seo,
        "articles": *[_type == "article" && references(^._id) && wasDeleted != true && isDraft != true] | order(date desc){
          _type,
          title,
          subtitle,
          'slug': slug.current,
          date,
          image{${queries.assetMeta}},
          'tag': tags[0]->{'slug': slug.current, title},
          excerpt[]{${queries.ptContent}},
          authors[]->{
            title,
            'slug': slug.current,
            image{${queries.assetMeta}},
            role,
            bio[]{${queries.ptContent}},
          },
        }
      },
      ${queries.site},
    }
    `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

// Fetch all pages with basic info for menu
export async function getAllPages(preview) {
  const query = `
    *[_type == "page" && wasDeleted != true && isDraft != true] | order(_updatedAt desc) {
      _id,
      title,
      "slug": slug.current,
      "isHome": _id == ${queries.homeID}
    }
  `
  
  const data = await getSanityClient(preview).fetch(query)
  return data
}

export { queries }
