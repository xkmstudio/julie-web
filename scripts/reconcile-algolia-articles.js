#!/usr/bin/env node

/**
 * Reconcile Algolia articles index with Sanity articles.
 *
 * Removes Algolia records whose objectID does not exist in Sanity.
 *
 * Usage:
 *   node scripts/reconcile-algolia-articles.js
 *   node scripts/reconcile-algolia-articles.js --dry-run
 */

try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv is optional if env vars are already present
}

const { createClient } = require('@sanity/client')
const { algoliasearch } = require('algoliasearch')

const isDryRun = process.argv.includes('--dry-run')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

async function browseAllAlgoliaRecords(client, indexName) {
  const pageSize = 1000
  let page = 0
  let allHits = []

  while (true) {
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query: '',
        page,
        hitsPerPage: pageSize,
      },
    })

    const hits = Array.isArray(result.hits) ? result.hits : []
    allHits = allHits.concat(hits)

    const nbPages = Number.isFinite(result.nbPages) ? result.nbPages : 0
    if (page + 1 >= nbPages) break
    page += 1
  }

  return allHits
}

async function run() {
  const projectId = requireEnv('SANITY_PROJECT_ID')
  const dataset = requireEnv('SANITY_PROJECT_DATASET')
  const sanityToken = requireEnv('SANITY_API_TOKEN')
  const algoliaAppId = requireEnv('NEXT_PUBLIC_ALGOLIA_APP_ID')
  const algoliaAdminKey = requireEnv('ALGOLIA_ADMIN_API_KEY')
  const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'

  const sanity = createClient({
    projectId,
    dataset,
    token: sanityToken,
    apiVersion: '2021-03-25',
    useCdn: false,
  })

  const algolia = algoliasearch(algoliaAppId, algoliaAdminKey)

  console.log(`Reconciling Algolia index "${algoliaIndexName}" against Sanity articles...`)
  if (isDryRun) {
    console.log('Dry run enabled: no records will be deleted.')
  }

  const sanityIds = await sanity.fetch(
    '*[_type == "article" && !(_id in path("drafts.**"))]{ _id }'
  )
  const sanityIdSet = new Set(sanityIds.map((doc) => doc._id))

  const algoliaHits = await browseAllAlgoliaRecords(algolia, algoliaIndexName)
  const staleHits = algoliaHits.filter(
    (hit) => typeof hit.objectID === 'string' && !sanityIdSet.has(hit.objectID)
  )

  console.log(`Sanity published articles: ${sanityIdSet.size}`)
  console.log(`Algolia records scanned: ${algoliaHits.length}`)
  console.log(`Stale Algolia records: ${staleHits.length}`)

  if (staleHits.length === 0) {
    console.log('No stale records found.')
    return
  }

  const preview = staleHits.slice(0, 15).map((hit) => ({
    objectID: hit.objectID,
    title: hit.title || '',
    slug: hit.slug || '',
  }))
  console.log('Sample stale records:', JSON.stringify(preview, null, 2))

  if (isDryRun) {
    console.log('Dry run complete.')
    return
  }

  const idsToDelete = staleHits.map((hit) => hit.objectID)
  await algolia.deleteObjects({
    indexName: algoliaIndexName,
    objectIDs: idsToDelete,
  })

  console.log(`Deleted ${idsToDelete.length} stale Algolia record(s).`)
}

run().catch((error) => {
  console.error('Reconcile failed:', error.message)
  process.exit(1)
})
