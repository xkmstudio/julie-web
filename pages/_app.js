import React, { useEffect, useLayoutEffect, useMemo } from 'react'
import Router from 'next/router'
import Head from 'next/head'
import {
  LazyMotion,
  domAnimation,
  motion,
  AnimatePresence,
} from 'framer-motion'
import { JetBrains_Mono } from 'next/font/google'
import Header from '@components/header'
import Footer from '@components/footer'
import Cart from '@components/cart'


import '../styles/tailwind.css'
import '../styles/app.css'

// Load JetBrains Mono font with all required weights
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

import { isBrowser, useScrollRestoration } from '@lib/helpers'
import { pageTransitionSpeed } from '@lib/animate'

import {
  SiteContextProvider,
  useSiteContext,
  useTogglePageTransition,
} from '@lib/context'

// Combine all page types for 3D menu
const combineAllPages = (site) => {
  if (!site) return []
  
  const allPages = []
  
  // Add regular pages
  if (site.pages) {
    allPages.push(...site.pages.map(page => ({
      ...page,
      type: 'page'
    })))
  }
  
  // Add products
  if (site.products) {
    allPages.push(...site.products.map(product => ({
      ...product,
      type: 'product'
    })))
  }
  
  // Add collections
  if (site.collections) {
    allPages.push(...site.collections.map(collection => ({
      ...collection,
      type: 'collection'
    })))
  }
  
  // Add tutorials page
  if (site.tutorialsPage) {
    allPages.push({
      ...site.tutorialsPage,
      type: 'tutorialsPage'
    })
  }
  
  // Sort by _updatedAt descending to show newest first
  // Fallback to _createdAt if _updatedAt doesn't exist
  return allPages.sort((a, b) => {
    const aDate = a._updatedAt || a._createdAt || '0'
    const bDate = b._updatedAt || b._createdAt || '0'
    // Compare dates - newer dates come first
    if (!aDate || !bDate) return 0
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })
}

const Site = ({ Component, pageProps, router }) => {
  const togglePageTransition = useTogglePageTransition()
  const { isPageTransition } = useSiteContext()

  const { data } = pageProps

  // Handle scroll position on history change
  useScrollRestoration(router, pageTransitionSpeed)

  // Handle anchor scroll on page load/navigation
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Get anchor from query params
    const urlParams = new URLSearchParams(window.location.search)
    const anchor = urlParams.get('anchor')
    
    if (anchor) {
      // Small delay to ensure content is rendered
      const scrollToAnchor = () => {
        const element = document.querySelector(`[data-anchor="${anchor}"]`)
        if (element) {
          // Get header height for offset
          const headerHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--headerHeight') || '80',
            10
          )
          
          const elementPosition = element.getBoundingClientRect().top + window.scrollY
          const offsetPosition = elementPosition - headerHeight - 20 // Extra 20px padding
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }
      
      // Try immediately, then with delays for dynamic content
      scrollToAnchor()
      setTimeout(scrollToAnchor, 100)
      setTimeout(scrollToAnchor, 500)
    }
  }, [router.asPath])

  // Restore scroll position immediately if coming back from chat (before page renders)
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    
    const restoreScroll = sessionStorage.getItem('emaChatRestoreScroll')
    const restoreRoute = sessionStorage.getItem('emaChatRestoreRoute')
    
    // Check if we should restore scroll for current route
    if (restoreScroll && restoreRoute) {
      // Check if current path matches the restore route (handle query params)
      const currentPath = router.asPath.split('?')[0]
      const restorePath = restoreRoute.split('?')[0]
      
      if (currentPath === restorePath) {
        const scrollY = parseInt(restoreScroll, 10)
        
        // Restore immediately, synchronously before React paints
        window.scrollTo(0, scrollY)
        document.documentElement.scrollTop = scrollY
        document.body.scrollTop = scrollY
        
        // Don't clear flags here - let useScrollRestoration handle it
        // so it doesn't scroll to 0
      }
    }
  }, [router.asPath])

  // Trigger our loading class
  // useEffect(() => {
  //   if (isBrowser) {
  //     document.documentElement.classList.toggle('is-loading', isPageTransition)
  //   }
  // }, [isPageTransition])

  // Setup page transition loading states
  useEffect(() => {
    Router.events.on('routeChangeStart', (_, { shallow }) => {
      // Bail if we're just changing URL parameters
      if (shallow) return

      // Otherwise, start loading
      togglePageTransition(true)
    })

    Router.events.on('routeChangeComplete', () => {
      setTimeout(() => togglePageTransition(false), pageTransitionSpeed)
    })

    Router.events.on('routeChangeError', () => {
      togglePageTransition(false)
    })
  }, [])

  // Initialize Klaviyo popup form only after user interacts with Pandectes
  // and allows targeting/marketing cookies. Fires once per browser session,
  // with at least a 3 second delay after consent.
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Don't show popup on ema-chat route
    if (router.pathname === '/ema-chat') return

    const KLAVIYO_FORM_ID = 'RQXCNA'
    let cancelled = false
    let opened = false

    const triggerKlaviyoPopup = () => {
      if (cancelled || typeof window === 'undefined') return
      if (opened) return

      try {
        const onsite = window._klOnsite || []
        window._klOnsite = onsite

        if (!Array.isArray(onsite)) return

        // Queue the openForm command – Klaviyo will process this when its script is ready
        onsite.push(['openForm', KLAVIYO_FORM_ID])

        // If Klaviyo has already attached a helper, try that too.
        if (typeof onsite.openForm === 'function') {
          try {
            onsite.openForm(KLAVIYO_FORM_ID)
          } catch (e) {
            console.warn('[Klaviyo] openForm method failed', e)
          }
        }

        opened = true
        // Mark on window for extra safety across route changes
        window.__klaviyoPopupOpened = true
      } catch (error) {
        console.error('[Klaviyo] Error initializing popup', error)
      }
    }

    const handlePandectesConsent = (event) => {
      if (cancelled) return
      if (window.__klaviyoPopupOpened) return

      try {
        const detail = event?.detail
        const preferences = detail?.preferences
        const consentType = detail?.consentType

        // Only react to real user interaction (new or changed consent),
        // not default/initial state.
        if (consentType !== 'new' && consentType !== 'stored' && consentType !== 'revoke') {
          return
        }

        // If preferences is not defined, don't run anything
        if (typeof preferences !== 'number') return

        // In Pandectes, (preferences & 4) === 0 means targeting/marketing cookies are allowed
        const targetingAllowed = (preferences & 4) === 0

        if (!targetingAllowed) return

        // Wait at least 3 seconds after consent interaction before showing popup
        setTimeout(() => {
          if (!cancelled && !window.__klaviyoPopupOpened) {
            triggerKlaviyoPopup()
          }
        }, 3000)
      } catch (error) {
        console.error('[Pandectes] Error handling consent event', error)
      }
    }

    window.addEventListener('PandectesEvent_OnConsent', handlePandectesConsent)

    return () => {
      cancelled = true
      window.removeEventListener('PandectesEvent_OnConsent', handlePandectesConsent)
    }
  }, [router.pathname])

  // intelligently add focus states if keyboard is used
  const handleFirstTab = (event) => {
    if (event.keyCode === 9) {
      if (isBrowser) {
        document.body.classList.add('is-tabbing')
        window.removeEventListener('keydown', handleFirstTab)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab)
    return () => {
      window.removeEventListener('keydown', handleFirstTab)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const TRACKING_PIXEL_SELECTOR = 'img[src*="arttrk.com/pixel"]'

    const markTrackingPixelsDecorative = (root = document) => {
      const pixels =
        root instanceof Element && root.matches?.(TRACKING_PIXEL_SELECTOR)
          ? [root]
          : Array.from(root.querySelectorAll?.(TRACKING_PIXEL_SELECTOR) || [])

      pixels.forEach((pixel) => {
        pixel.setAttribute('alt', '')
        pixel.setAttribute('aria-hidden', 'true')
        pixel.setAttribute('role', 'presentation')
        pixel.setAttribute('decoding', 'async')

        // Keep invisible tracking pixels out of tab/focus heuristics.
        if (!pixel.hasAttribute('tabindex')) {
          pixel.setAttribute('tabindex', '-1')
        }
      })
    }

    markTrackingPixelsDecorative()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            markTrackingPixelsDecorative(node)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  const pageID = useMemo(() => data?.page?.id, [data])

  return (
    <LazyMotion features={domAnimation}>
      {' '}
      {isPageTransition && (
        <Head>
          <title>Loading...</title>
        </Head>
      )}
      <div className={`${jetbrainsMono.variable}`}>
        {router.pathname !== '/ema-chat' && (
          <Header
            key="header"
            data={data?.site.header}
            footer={data?.site.footer}
            pages={combineAllPages(data?.site)}
          />
        )}
        {/* <Scene key="scene" /> */}
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            document.body.classList.remove('overflow-hidden')
          }}
        >
          <Component key={pageID} {...pageProps} />
        </AnimatePresence>
        <Cart data={{ ...data?.site }} />
        {router.pathname !== '/ema-chat' && (
          <Footer
            key="footer"
            data={data?.site.footer}
          />
        )}
      </div>
    </LazyMotion>
  )
}

// Site wrapped with Context Providers
const MyApp = ({ Component, pageProps, router }) => {
  const { data } = pageProps

  return (
    <SiteContextProvider data={{ ...data?.site }}>
      <Site Component={Component} pageProps={pageProps} router={router} />
    </SiteContextProvider>
  )
}

export default MyApp
