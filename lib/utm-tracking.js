// UTM Parameter Tracking Utility
// Handles capturing, storing, and passing UTM parameters through the checkout flow

const UTM_STORAGE_KEY = 'sol_utm_params'
const UTM_EXPIRY_DAYS = 30

// UTM parameters to track
const UTM_PARAMS = [
  'utm_source',
  'utm_medium', 
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid' // Google Ads click ID
]

// Get UTM parameters from current URL
export function getUTMParamsFromURL() {
  if (typeof window === 'undefined') return {}
  
  const urlParams = new URLSearchParams(window.location.search)
  const utmParams = {}
  
  UTM_PARAMS.forEach(param => {
    const value = urlParams.get(param)
    if (value) {
      utmParams[param] = value
    }
  })
  
  return utmParams
}

// Store UTM parameters in localStorage with expiry
export function storeUTMParams(params) {
  if (typeof window === 'undefined' || Object.keys(params).length === 0) return
  
  const utmData = {
    params,
    timestamp: Date.now(),
    expiry: Date.now() + (UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  }
  
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData))
  } catch (error) {
    console.warn('Failed to store UTM parameters:', error)
  }
}

// Get stored UTM parameters
export function getStoredUTMParams() {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY)
    if (!stored) return {}
    
    const utmData = JSON.parse(stored)
    
    // Check if expired
    if (Date.now() > utmData.expiry) {
      localStorage.removeItem(UTM_STORAGE_KEY)
      return {}
    }
    
    return utmData.params
  } catch (error) {
    console.warn('Failed to retrieve UTM parameters:', error)
    return {}
  }
}

// Initialize UTM tracking on page load
export function initializeUTMTracking() {
  if (typeof window === 'undefined') return
  
  // Get UTM params from URL
  const urlParams = getUTMParamsFromURL()
  
  // If we have UTM params in URL, store them
  if (Object.keys(urlParams).length > 0) {
    storeUTMParams(urlParams)
  }
}

// Get all UTM parameters (from URL or stored)
export function getAllUTMParams() {
  const urlParams = getUTMParamsFromURL()
  const storedParams = getStoredUTMParams()
  
  // URL params take precedence over stored params
  return { ...storedParams, ...urlParams }
}

// Convert UTM params to cart attributes format
export function utmParamsToCartAttributes(utmParams) {
  const attributes = {}
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      attributes[key] = value
    }
  })
  
  return attributes
}

// Add UTM parameters to checkout URL
export function addUTMToCheckoutURL(checkoutURL, utmParams) {
  if (!checkoutURL || Object.keys(utmParams).length === 0) return checkoutURL
  
  try {
    const url = new URL(checkoutURL)
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      }
    })
    
    return url.toString()
  } catch (error) {
    console.warn('Failed to add UTM params to checkout URL:', error)
    return checkoutURL
  }
} 