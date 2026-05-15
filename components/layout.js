import React, { useEffect } from 'react'
import Script from 'next/script'

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

const isValidEmail = (value) =>
  typeof value === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// Optional: pass a known shopper email to merge this browser with a Klaviyo profile (e.g. after Customer Account API login).
const Layout = ({
  site = {},
  page = {},
  schema,
  children,
  klaviyoIdentifyEmail,
}) => {
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

  const klaviyoPublicKey =
    process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY?.trim() ||
    site.klaviyoPublicKey?.trim() ||
    'TqnjxU'

  useEffect(() => {
    if (!isBrowser || !isValidEmail(klaviyoIdentifyEmail)) return

    const email = klaviyoIdentifyEmail.trim()
    let cancelled = false
    let attempts = 0
    const maxAttempts = 80

    const tryIdentify = () => {
      if (cancelled) return
      attempts += 1
      if (typeof window.klaviyo?.identify === 'function') {
        try {
          window.klaviyo.identify({ email })
        } catch (e) {
          console.warn('[Klaviyo] identify failed', e)
        }
        return
      }
      if (attempts < maxAttempts) {
        setTimeout(tryIdentify, 100)
      }
    }

    tryIdentify()
    return () => {
      cancelled = true
    }
  }, [klaviyoIdentifyEmail])

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
      <Script
        id="klaviyo-onsite"
        src={`https://static.klaviyo.com/onsite/js/${klaviyoPublicKey}/klaviyo.js`}
        strategy="lazyOnload"
      />
    </>
  )
}

export default Layout
