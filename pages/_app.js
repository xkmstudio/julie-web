import React, { useEffect, useMemo } from 'react'
import Router from 'next/router'
import Head from 'next/head'
import {
  LazyMotion,
  domAnimation,
  motion,
  AnimatePresence,
} from 'framer-motion'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Header from '@components/header'
import Footer from '@components/footer'
import Cart from '@components/cart'
import EmaChat from '@components/emaChat'


import '../styles/tailwind.css'
import '../styles/app.css'

// Load Inter font with all required weights
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

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

  const pageID = useMemo(() => data?.page?.id, [data])

  return (
    <LazyMotion features={domAnimation}>
      {' '}
      {isPageTransition && (
        <Head>
          <title>Loading...</title>
        </Head>
      )}
      <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Header
          key="header"
          data={data?.site.header}
          footer={data?.site.footer}
          pages={combineAllPages(data?.site)}
        />
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
        <EmaChat />
        <Footer
          key="footer"
          data={data?.site.footer}
        />
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
