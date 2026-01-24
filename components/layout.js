import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'

import { isBrowser, useWindowSize } from '@lib/helpers'

import HeadSEO from '@components/head-seo'
import { m, AnimatePresence } from 'framer-motion'
import { pageTransitionAnim, pageTransitionSpeed } from '@lib/animate'

const variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: pageTransitionSpeed / 1000,
      delay: 0.3,
      ease: 'linear',
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: pageTransitionSpeed / 1000,
      ease: 'linear',
      when: 'beforeChildren',
    },
  },
}

const Layout = ({ site = {}, page = {}, schema, children }) => {
  // set window height var
  const { height: windowHeight, width } = useWindowSize()

  //setup ga4 events

  // // https://developers.google.com/analytics/devguides/collection/gtagjs/pages
  // const pageview = (url) => {
  //   window.gtag('config', site.gtmID, {
  //     page_path: url,
  //   })
  // }

  // // https://developers.google.com/analytics/devguides/collection/gtagjs/events
  // const event = ({ action, category, label, value }) => {
  //   window.gtag('event', action, {
  //     event_category: category,
  //     event_label: label,
  //     value: value,
  //   })
  // }

  // const router = useRouter()

  // useEffect(() => {
  //   const handleRouteChange = (url) => {
  //     pageview(url)
  //   }
  //   router.events.on('routeChangeComplete', handleRouteChange)
  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange)
  //   }
  // }, [router.events])

  useEffect(() => {
    if (isBrowser) {
      document.body.style.setProperty('--vh', `${windowHeight * 0.01}px`)
    }
  }, [width])

  return (
    <>
      <HeadSEO site={site} page={page} schema={schema} />
      {site.gtmID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${site.gtmID}`}
          />
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-${site.gtmID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </>
      )}
      <m.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
      >
        <main id="content" className={`padding-${page.padding || 'none'}`}>{children}</main>
      </m.div>
    </>
  )
}

export default Layout
