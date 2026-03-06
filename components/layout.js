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

  const gtmId = site.gtmID || 'GTM-NB3XS74'

  return (
    <>
      <HeadSEO site={site} page={page} schema={schema} />
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
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
