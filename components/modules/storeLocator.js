import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { LuckyIdScripts } from '@components/LuckyLocal/Scripts'

export default function FindJulieInStores() {
  const wrapperRef = useRef(null)
  const router = useRouter()
  
  // Track cleanup functions and timeouts
  const cleanupRef = useRef({
    script: null,
    errorHandler: null,
    unhandledRejectionHandler: null,
    checkInterval: null,
    timeouts: [],
    rafIds: [],
  })

  useEffect(() => {
    // Ensure the initial configuration script has loaded before loading the store locator
    let retryCount = 0
    const maxRetries = 50 // 5 seconds max wait time
    
    const loadStoreLocator = () => {
      retryCount++
      
      // Check if wrapper div exists in DOM
      const wrapperDiv = document.getElementById('lucky-wrapper-store-locator')
      if (!wrapperDiv) {
        if (retryCount < maxRetries) {
          setTimeout(loadStoreLocator, 100)
        } else {
          console.error('Store locator wrapper div not found after max retries')
        }
        return
      }

      // Check if the initial script exists and window variables are set
      const initialScript = document.getElementById('lucky-initial-script')
      const hasConfig = typeof window !== 'undefined' && 
                       window.LK_APP_BASE_URL && 
                       window.LK_BRAND_NAME

      if (!initialScript || !hasConfig) {
        if (retryCount < maxRetries) {
          // Wait a bit for the initial script to be added by LuckyIdScripts
          setTimeout(loadStoreLocator, 100)
        } else {
          console.error('Store locator configuration not found after max retries', {
            hasInitialScript: !!initialScript,
            hasConfig,
            LK_APP_BASE_URL: window.LK_APP_BASE_URL,
            LK_BRAND_NAME: window.LK_BRAND_NAME,
          })
        }
        return
      }

      // Check if store locator script is already loaded
      if (document.getElementById('lucky-store-locator-script')) {
        return
      }

      console.log('Loading LuckyLabs store locator with config:', {
        LK_APP_BASE_URL: window.LK_APP_BASE_URL,
        LK_BRAND_NAME: window.LK_BRAND_NAME,
      })

      // Ensure wrapper div is visible and ready (we already checked it exists above)
      const wrapperElement = document.getElementById('lucky-wrapper-store-locator')
      if (wrapperElement) {
        // Make sure the wrapper is visible (some widgets check for visibility)
        wrapperElement.style.display = 'block'
        wrapperElement.style.visibility = 'visible'
        // Ensure it has dimensions
        if (!wrapperElement.style.width) {
          wrapperElement.style.width = '100%'
        }
        if (!wrapperElement.style.height && !wrapperElement.style.minHeight) {
          wrapperElement.style.minHeight = '400px'
        }
      }

      // Load as module script (matching the working site)
      // Module scripts execute asynchronously, so we need to ensure the wrapper is ready
      const script = document.createElement('script')
      script.id = 'lucky-store-locator-script'
      script.src = 'https://cdn.luckylabs.io/prd/store-locator/org/index.js'
      script.type = 'module'
      script.crossOrigin = 'anonymous'
      
      // Catch all errors that might occur
      const errorHandler = (event) => {
        if (event.filename && event.filename.includes('luckylabs.io')) {
          console.error('❌ Error from LuckyLabs module:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
            stack: event.error?.stack,
          })
        }
      }
      
      // Catch unhandled promise rejections (modules often use dynamic imports)
      const unhandledRejectionHandler = (event) => {
        const reason = event.reason
        if (reason && (
          (typeof reason === 'string' && reason.includes('luckylabs')) ||
          (reason.message && reason.message.includes('luckylabs')) ||
          (reason.stack && reason.stack.includes('luckylabs.io'))
        )) {
          console.error('❌ Unhandled promise rejection from LuckyLabs:', reason)
        }
      }
      
      window.addEventListener('error', errorHandler, true)
      window.addEventListener('unhandledrejection', unhandledRejectionHandler)
      
      // Store handlers for cleanup
      cleanupRef.current.errorHandler = errorHandler
      cleanupRef.current.unhandledRejectionHandler = unhandledRejectionHandler
      
      script.onerror = (error) => {
        console.error('❌ Failed to load LuckyLabs store locator script:', error)
        window.removeEventListener('error', errorHandler, true)
        window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
      }
      
      // For module scripts, onload fires when the module is loaded but may not be executed yet
      script.onload = () => {
        console.log('LuckyLabs store locator module script loaded')
        
        // Module scripts execute asynchronously, check multiple times
        let checkCount = 0
        const maxChecks = 20 // Check for 10 seconds (20 * 500ms)
        
        const checkInitialization = () => {
          checkCount++
          const wrapper = document.getElementById('lucky-wrapper-store-locator')
          const shadowHost = wrapper?.querySelector('.lucky-host-shadow-dom')
          
          if (shadowHost) {
            console.log('✅ Shadow DOM host found - widget initialized!')
            window.removeEventListener('error', errorHandler, true)
            window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
            
            // Check if shadow root has content
            if (shadowHost.shadowRoot) {
              console.log('Shadow root exists with', shadowHost.shadowRoot.children.length, 'children')
            } else {
              console.log('Shadow root not yet attached - widget may still be loading content')
            }
            return
          }
          
          if (checkCount < maxChecks) {
            // Continue checking
            const timeoutId = setTimeout(checkInitialization, 500)
            cleanupRef.current.timeouts.push(timeoutId)
          } else {
            // Final check - widget didn't initialize
            console.error('❌ Widget failed to initialize after', maxChecks * 500, 'ms')
            console.log('Final state:', {
              wrapperExists: !!wrapper,
              hasChildren: wrapper?.children.length > 0,
              shadowHostExists: false,
              wrapperHTML: wrapper?.innerHTML,
              windowConfig: {
                LK_APP_BASE_URL: window.LK_APP_BASE_URL,
                LK_BRAND_NAME: window.LK_BRAND_NAME,
              },
            })
            
            // Check Network tab for failed requests
            console.log('💡 Troubleshooting steps:')
            console.log('1. Network tab - check for any failed (red) requests to luckylabs.io')
            console.log('2. Console - look for any red error messages above')
            console.log('3. CSP - check if Content-Security-Policy headers are blocking the script')
            console.log('4. Compare - verify the script URL matches your working site exactly')
            console.log('5. Module imports - check if the module is trying to import other modules that fail')
            
            window.removeEventListener('error', errorHandler, true)
            window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
          }
        }
        
        // Start checking after a short delay
        const initialTimeoutId = setTimeout(checkInitialization, 500)
        cleanupRef.current.timeouts.push(initialTimeoutId)
      }
      
      // Append to head (module scripts typically go in head)
      document.head.appendChild(script)
      
      // Store script reference for cleanup
      cleanupRef.current.script = script
    }

    // Add custom styles
    const css = `
      main .page-width { margin: 0!important; width: 100%; padding: 0; max-width: 100%; }
      .page-title { display: none!important; }
    `
    
    // Only add styles if not already added
    if (!document.getElementById('lucky-store-locator-styles')) {
      const styleEle = document.createElement('style')
      styleEle.type = 'text/css'
      styleEle.id = 'lucky-store-locator-styles'
      if (styleEle.styleSheet) {
        // This is required for IE8 and below.
        styleEle.styleSheet.cssText = css
      } else {
        styleEle.appendChild(document.createTextNode(css))
      }
      document.head.appendChild(styleEle)
    }

    // Wait for component to mount and React to finish rendering
    // Use requestAnimationFrame to ensure DOM is ready
    let rafId1, rafId2, timeoutId
    rafId1 = requestAnimationFrame(() => {
      // Double RAF to ensure React has finished rendering
      rafId2 = requestAnimationFrame(() => {
        timeoutId = setTimeout(loadStoreLocator, 100)
        cleanupRef.current.timeouts.push(timeoutId)
      })
      cleanupRef.current.rafIds.push(rafId2)
    })
    cleanupRef.current.rafIds.push(rafId1)

    // Cleanup function
    const cleanup = () => {
      // Clear all timeouts
      cleanupRef.current.timeouts.forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId)
      })
      cleanupRef.current.timeouts = []
      
      // Cancel all animation frames
      cleanupRef.current.rafIds.forEach(rafId => {
        if (rafId) cancelAnimationFrame(rafId)
      })
      cleanupRef.current.rafIds = []
      
      // Remove event listeners
      if (cleanupRef.current.errorHandler) {
        window.removeEventListener('error', cleanupRef.current.errorHandler, true)
      }
      if (cleanupRef.current.unhandledRejectionHandler) {
        window.removeEventListener('unhandledrejection', cleanupRef.current.unhandledRejectionHandler)
      }
      
      // Remove script element
      if (cleanupRef.current.script && cleanupRef.current.script.parentNode) {
        cleanupRef.current.script.parentNode.removeChild(cleanupRef.current.script)
      }
      
      // Clear wrapper content (widget should handle its own cleanup, but we'll clear the container)
      const wrapper = document.getElementById('lucky-wrapper-store-locator')
      if (wrapper) {
        wrapper.innerHTML = ''
      }
      
      // Reset cleanup ref
      cleanupRef.current = {
        script: null,
        errorHandler: null,
        unhandledRejectionHandler: null,
        checkInterval: null,
        timeouts: [],
        rafIds: [],
      }
    }

    // Handle route changes
    const handleRouteChange = (url) => {
      cleanup()
    }

    // Listen for route changes
    router.events.on('routeChangeStart', handleRouteChange)

    // Return cleanup function
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      cleanup()
    }
  }, [router])

  return (
    <section
      className="w-full section-padding"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <LuckyIdScripts />
      <div 
        id="lucky-wrapper-store-locator" 
        ref={wrapperRef}
        style={{ minHeight: '400px', width: '100%' }}
      ></div>
    </section>
  )
}
