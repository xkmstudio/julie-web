#!/usr/bin/env node

/**
 * Script to sync all articles from Sanity to Algolia
 * 
 * Usage:
 *   # Local development (default - requires dev server running)
 *   node scripts/sync-algolia.js
 *   
 *   # Production (use production URL)
 *   SYNC_TARGET=production node scripts/sync-algolia.js
 *   
 *   # Or add to package.json:
 *   npm run sync:algolia
 * 
 * Prerequisites:
 *   1. Make sure your Next.js dev server is running (npm run dev)
 *   2. Ensure your .env.local file has all required variables:
 *      - NEXT_PUBLIC_ALGOLIA_APP_ID
 *      - ALGOLIA_ADMIN_API_KEY
 *      - SANITY_PROJECT_ID
 *      - SANITY_PROJECT_DATASET
 *      - SANITY_API_TOKEN
 * 
 * This is useful for:
 * - Initial setup
 * - Re-syncing all articles after index changes
 * - Manual sync when needed
 */

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv might not be installed, that's okay if env vars are set another way
}

async function syncAllArticles() {
  // Import fetch (Node 18+ has native fetch, otherwise use node-fetch)
  let fetch
  try {
    fetch = globalThis.fetch || (await import('node-fetch')).default
  } catch (e) {
    console.error('❌ Could not load fetch. Please use Node 18+ or install node-fetch')
    process.exit(1)
  }

  // Default to localhost for local development
  // Only use production URL if explicitly set via SYNC_TARGET env var
  const useProduction = process.env.SYNC_TARGET === 'production'
  const apiUrl = useProduction && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'http://localhost:3000'
  
  const isLocal = !useProduction
  
  const endpoint = `${apiUrl}/api/algolia/sync-article`

  console.log('🚀 Starting Algolia sync...')
  console.log(`📡 Endpoint: ${endpoint}`)
  if (isLocal) {
    console.log('💡 Using local dev server. Make sure it\'s running!')
  }
  console.log('⏳ This may take a moment...\n')

  try {
    // First, test if the endpoint is accessible with a GET request
    console.log('🔍 Testing endpoint connectivity...')
    const testResponse = await fetch(endpoint, {
      method: 'GET',
    })
    
    if (!testResponse.ok && testResponse.status !== 405) {
      const testText = await testResponse.text()
      console.error(`❌ Endpoint test failed: ${testResponse.status}`)
      console.error(`Response: ${testText}`)
      process.exit(1)
    }
    
    console.log('✅ Endpoint is accessible\n')

    // Now perform the actual sync
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Get response text first to handle both JSON and text responses
    const responseText = await response.text()
    let result

    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      // If response is not JSON, use the text as the error message
      result = { error: responseText, status: response.status }
    }

    if (response.ok) {
      console.log('✅ Sync successful!')
      console.log(`📊 Synced ${result.count} articles to Algolia`)
      console.log(`🔍 Index: ${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'}`)
    } else {
      console.error('❌ Sync failed:')
      console.error(`Status: ${response.status} ${response.statusText}`)
      if (result.error) {
        console.error(`Error: ${result.error}`)
      } else {
        console.error(JSON.stringify(result, null, 2))
      }
      
      if (response.status === 405) {
        console.error('\n💡 Method Not Allowed - Make sure:')
        console.error('   1. The API route exists at /api/algolia/sync-article')
        console.error('   2. The route handles PUT requests')
        console.error('   3. Your Next.js server is running (for local)')
      }
      
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error during sync:', error.message)
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.error('💡 Connection failed. Make sure:')
      console.error(`   1. Your Next.js dev server is running on ${apiUrl}`)
      console.error('   2. The server is accessible')
      if (isLocal) {
        console.error('   3. Run "npm run dev" in another terminal')
      }
    } else if (error.message.includes('Unexpected token')) {
      console.error('💡 Received non-JSON response. The API might be returning an error page.')
      console.error('   Check the API route is correctly configured.')
    }
    process.exit(1)
  }
}

// Run the sync
syncAllArticles()
