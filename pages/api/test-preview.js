// Simple test endpoint to verify the API is working
// Call this first to make sure everything is set up correctly

import {createClient} from '@sanity/client'

const sanity = createClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
})

export default async function handler(req, res) {
  console.log('=== Test Preview API ===')
  console.log('Environment check:')
  console.log('- SANITY_PROJECT_DATASET:', process.env.SANITY_PROJECT_DATASET ? '✅ Set' : '❌ Missing')
  console.log('- SANITY_PROJECT_ID:', process.env.SANITY_PROJECT_ID ? '✅ Set' : '❌ Missing')
  console.log('- SANITY_API_TOKEN:', process.env.SANITY_API_TOKEN ? '✅ Set' : '❌ Missing')
  console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || '❌ Missing (using default)')
  console.log('- WEBHOOK_SECRET:', process.env.WEBHOOK_SECRET ? '✅ Set' : '⚠️ Not set (optional)')

  // Test Sanity connection
  try {
    const testQuery = await sanity.fetch(`*[_type == "page"][0]{ _id, title, "slug": slug.current }`)
    console.log('Sanity connection test:', testQuery ? '✅ Success' : '❌ No pages found')
    
    return res.status(200).json({
      success: true,
      message: 'API is working',
      environment: {
        hasDataset: !!process.env.SANITY_PROJECT_DATASET,
        hasProjectId: !!process.env.SANITY_PROJECT_ID,
        hasToken: !!process.env.SANITY_API_TOKEN,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        hasWebhookSecret: !!process.env.WEBHOOK_SECRET,
      },
      sanityTest: testQuery || 'No pages found',
    })
  } catch (error) {
    console.error('Sanity connection error:', error)
    return res.status(500).json({
      success: false,
      message: 'Sanity connection failed',
      error: error.message,
    })
  }
}

