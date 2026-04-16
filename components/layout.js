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
      <Script
        id="pandectes-rules"
        src="https://st.pandect.es/julie-products-inc/pandectes-rules.js"
        strategy="afterInteractive"
      />
      <Script
        id="pandectes-core"
        src="https://s.pandect.es/scripts/pandectes-core.js"
        strategy="afterInteractive"
      />
      <Script
        id="klaviyo-onsite"
        src="https://static.klaviyo.com/onsite/js/TqnjxU/klaviyo.js"
        strategy="lazyOnload"
      />
      <Script
        id="accessibe-widget"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html:
            "(function(){ var s = document.createElement('script'); var h = document.querySelector('head') || document.body; s.src = 'https://acsbapp.com/apps/app/dist/js/app.js'; s.async = true; s.onload = function(){ acsbJS.init(); }; h.appendChild(s); })();",
        }}
      />
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="lazyOnload"
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
