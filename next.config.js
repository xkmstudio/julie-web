const {createClient} = require('@sanity/client')
const client = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2021-03-25',
})

// see breakdown of code bloat
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// get redirects from Sanity for Vercel
async function fetchSanityRedirects() {
  const data = await client.fetch(
    `*[_type == "redirect"]{ from, to, isPermanent }`
  )

  const redirects = data.map((redirect) => {
    return {
      source: `/${redirect.from}`,
      destination: `/${redirect.to}`,
      permanent: redirect.isPermanent,
    }
  })

  return redirects
}

module.exports = withBundleAnalyzer({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    qualities: [75, 80],
  },
  turbopack: {},
  env: {
    // Needed for Sanity powered data
    SANITY_PROJECT_DATASET: process.env.SANITY_PROJECT_DATASET,
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,

    // Needed for Klaviyo forms
    KLAVIYO_API_KEY: process.env.KLAVIYO_API_KEY,

    // Needed for Mailchimp forms
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_SERVER: process.env.MAILCHIMP_SERVER,

    // Needed for SendGrid forms
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

    // Needed for Algolia search
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,

    // Needed for LuckyLabs store locator
    NEXT_PUBLIC_LK_APP_BASE_URL: process.env.NEXT_PUBLIC_LK_APP_BASE_URL,
    NEXT_PUBLIC_LK_BRAND_NAME: process.env.NEXT_PUBLIC_LK_BRAND_NAME,
    
    // Server-side only (not exposed to browser)
    // LUCKY_API_KEY: process.env.LUCKY_API_KEY,
    // LUCKY_EXT_API_URL: process.env.LUCKY_EXT_API_URL,
  },
  async redirects() {
    const sanityRedirects = await fetchSanityRedirects()
    return sanityRedirects
  },
  async rewrites() {
    return [
      // Rewrite /apps/app-proxy/* to /api/apps/app-proxy/*
      // This matches the Hydrogen route structure
      {
        source: '/apps/app-proxy/:path*',
        destination: '/api/apps/app-proxy/:path*',
      },
      // Rewrite /lucky-local/shopify/* to /api/lucky-local/shopify/*
      {
        source: '/lucky-local/shopify/:path*',
        destination: '/api/lucky-local/shopify/:path*',
      },
    ]
  },
})
