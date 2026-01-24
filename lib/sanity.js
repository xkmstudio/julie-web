import {createClient} from '@sanity/client'
import sanityImage from '@sanity/image-url'

// Determine if we're in production (not staging/preview)
// Netlify sets CONTEXT to 'production' for production deploys
// For staging/preview, we want fresh data without CDN caching
const isProduction = 
  process.env.NODE_ENV === 'production' && 
  process.env.CONTEXT === 'production'

const options = {
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  useCdn: isProduction, // Only use CDN in production, not staging/preview
  apiVersion: '2021-03-25',
}

export const sanityClient = createClient(options)
export const imageBuilder = sanityImage(sanityClient)

export function createPreviewClient(token) {
  return createClient({
    ...options,
    useCdn: false,
    token,
  })
}

export function getSanityClient(preview) {
  if (preview?.active) {
    return createPreviewClient(preview.token)
  } else {
    return sanityClient
  }
}
