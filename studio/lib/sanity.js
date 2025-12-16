import {createClient} from '@sanity/client'
import sanityImage from '@sanity/image-url'

const options = {
  dataset: 'production',
  projectId: '4ugo4i8e',
  useCdn: process.env.NODE_ENV === 'production',
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