import { getSanityClient } from '@lib/sanity'

/**
 * `/collections` is not a content page. The Primary Shop (`shopHome`) document in
 * Sanity points at the canonical collection — we 301 there so crawlers and users
 * hit a real URL with product content.
 *
 * Optional env: `SHOP_COLLECTION_INDEX_FALLBACK` (path, default `/collections/merch`)
 * when `shopHome` is missing or has no linked collection.
 */
export default function CollectionsIndex() {
  return null
}

export async function getServerSideProps({ preview, previewData }) {
  const client = getSanityClient({
    active: preview,
    token: previewData?.token,
  })

  const shopHome = await client.fetch(
    `*[_type == "shopHome"][0]{ "collectionSlug": collection->slug.current }`
  )

  const fallback =
    process.env.SHOP_COLLECTION_INDEX_FALLBACK || '/collections/merch'

  const slug = shopHome?.collectionSlug?.trim()
  const destination = slug ? `/collections/${slug}` : fallback

  return {
    redirect: {
      destination,
      permanent: true,
    },
  }
}
