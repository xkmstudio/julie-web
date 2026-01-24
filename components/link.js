import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import cx from 'classnames'

import Icon from '@components/icon'

import { getStaticRoute, getDynamicRoute } from '@lib/routes'
import { useToggleEmail } from '@lib/context'
import { useIsInFrame } from '@lib/helpers'

// Helper function to build URL for different page types
export const getPageUrl = (page) => {
  if (!page) return '/'
  
  const isHome = page.isHome
  if (isHome) return '/'

  const pageType = page.type
  const slug = page.slug || page.url

  // Map page types to their route prefixes
  switch (pageType) {
    case 'product':
      return `/products/${slug}`
    case 'collection':
      return `/collections/${slug}`
    case 'article':
      return `/blog/${slug}`
    case 'profile':
      return `/profiles/${slug}`
    case 'blog':
      return `/blog`
    case 'page':
    default:
      return `/pages/${slug}`
  }
}

const Link = ({ link, children, hasArrow = false, onFrameLinkClick, ...rest }) => {
  if (!link) return null

  const router = useRouter()
  const linkType = link.linkType || (link.url ? 'navLink' : 'navPage')
  const isAnchor = link.anchor != null || link.anchor != undefined
  const toggleEmail = useToggleEmail()
  const isInFrame = useIsInFrame()
  
  // Check if we should handle link in frame
  const shouldHandleInFrame = isInFrame && onFrameLinkClick

  console.log('linkType', linkType);
  

  // External Link (navLink)
  if (linkType === 'navLink') {
    return (
      <a
        href={link.url}
        target={!link.url?.match('^mailto:') ? '_blank' : null}
        rel="noopener noreferrer"
        className={
          link.isButton
            ? cx('btn', link.styles?.style, {
                'is-large': link.styles?.isLarge,
                'is-block': link.styles?.isBlock,
              })
            : null
        }
        {...rest}
      >
        <span>{link.title || children}</span>
        {hasArrow && (
          <span className="w-[1.2rem] h-[1.2rem] flex items-center justify-center ml-5">
            <Icon name="Arrow Out" viewBox="0 0 18 18" className="w-16 h-16" />
          </span>
        )}
      </a>
    )
  }

  // Ask Julie - navigate to chat page
  if (linkType === 'askJulie') {
    console.log('is ask');
    
    // Extract onClick from rest to merge handlers
    const { onClick: restOnClick, ...restProps } = rest
    
    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      console.log('Ask Julie link clicked, navigating to chat page')
      
      // Save current scroll position for restoration on back
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('emaChatReturnScroll', scrollY.toString())
      }
      
      // Build the URL with query params
      const currentPath = router.asPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
      const chatUrl = `/ema-chat?from=${encodeURIComponent(currentPath)}`
      
      console.log('Navigating to:', chatUrl)
      
      // Navigate immediately - use window.location as primary method for reliability
      if (typeof window !== 'undefined') {
        window.location.href = chatUrl
      } else {
        router.push(chatUrl).catch((error) => {
          console.error('Error navigating to chat page:', error)
        })
      }
      
      // Call any passed onClick handler after navigation starts (e.g., to close menu)
      if (restOnClick) {
        restOnClick(e)
      }
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cx('btn askJulie', link.styles?.style, {
          'is-large': link.styles?.isLarge,
          'is-block': link.styles?.isBlock,
        })}
        {...restProps}
      >
        <span>{link.title || children}</span>
        {hasArrow && (
          <span className="w-[1.2rem] h-[1.2rem] flex items-center justify-center ml-5">
            <Icon name="Arrow Out" viewBox="0 0 18 18" className="w-16 h-16" />
          </span>
        )}
      </button>
    )
  }

  // Nav Julie - navigate to chat page
  if (linkType === 'navJulie') {
    // Extract onClick from rest to merge handlers
    const { onClick: restOnClick, ...restProps } = rest
    
    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      console.log('Nav Julie link clicked, navigating to chat page')
      
      // Save current scroll position for restoration on back
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('emaChatReturnScroll', scrollY.toString())
      }
      
      // Build the URL with query params
      const currentPath = router.asPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
      const chatUrl = `/ema-chat?from=${encodeURIComponent(currentPath)}`
      
      console.log('Navigating to:', chatUrl)
      
      // Navigate immediately - use window.location as primary method for reliability
      if (typeof window !== 'undefined') {
        window.location.href = chatUrl
      } else {
        router.push(chatUrl).catch((error) => {
          console.error('Error navigating to chat page:', error)
        })
      }
      
      // Call any passed onClick handler after navigation starts (e.g., to close menu)
      if (restOnClick) {
        restOnClick(e)
      }
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cx('btn askJulie', link.styles?.style, {
          'is-large': link.styles?.isLarge,
          'is-block': link.styles?.isBlock,
        })}
        {...restProps}
      >
        <span>{link.title || children}</span>
        {hasArrow && (
          <span className="w-[1.2rem] h-[1.2rem] flex items-center justify-center ml-5">
            <Icon name="Arrow Out" viewBox="0 0 18 18" className="w-16 h-16" />
          </span>
        )}
      </button>
    )
  }

  // Internal Page (navPage)
  const pageUrl = getPageUrl(link.page)
  const href = isAnchor
    ? `${pageUrl}#${link.anchor.toLowerCase().replace(/\s+/g, '-')}`
    : pageUrl

  return (
    <NextLink
      href={href}
      className={
        link.isButton
          ? cx('btn', link.styles?.style, {
              'is-large': link.styles?.isLarge,
              'is-block': link.styles?.isBlock,
            })
          : null
      }
      {...rest}
      scroll={false}
    >
      <span>{link.title || children}</span>
      {hasArrow && (
        <span className="w-[1.2rem] h-[1.2rem] flex items-center justify-center ml-5">
          <Icon name="Arrow Out" viewBox="0 0 18 18" className="w-16 h-16" />
        </span>
      )}
    </NextLink>
  )
}

export default Link
