import React from 'react'
import NextLink from 'next/link'
import cx from 'classnames'

import Icon from '@components/icon'

import { getStaticRoute, getDynamicRoute } from '@lib/routes'
import { useToggleEmail, useToggleEmaChat } from '@lib/context'
import { useIsInFrame } from '@lib/helpers'

// Helper function to build URL for different page types
const getPageUrl = (page) => {
  if (!page) return '/'
  
  const isHome = page.isHome
  if (isHome) return '/'

  const pageType = page.type
  const slug = page.slug

  // Map page types to their route prefixes
  switch (pageType) {
    case 'product':
      return `/products/${slug}`
    case 'collection':
      return `/shop/${slug}`
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

  const linkType = link.linkType || (link.url ? 'navLink' : 'navPage')
  const isAnchor = link.anchor != null || link.anchor != undefined
  const toggleEmail = useToggleEmail()
  const toggleEmaChat = useToggleEmaChat()
  const isInFrame = useIsInFrame()
  
  // Check if we should handle link in frame
  const shouldHandleInFrame = isInFrame && onFrameLinkClick

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

  // Ask Julie - render as button that opens Ema chat
  if (linkType === 'askJulie') {
    const handleClick = (e) => {
      e.preventDefault()
      toggleEmaChat(true)
      if (rest.onClick) {
        rest.onClick(e)
      }
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cx('btn', link.styles?.style, {
          'is-large': link.styles?.isLarge,
          'is-block': link.styles?.isBlock,
        })}
        {...rest}
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

  // Nav Julie - render as button that opens Ema chat
  if (linkType === 'navJulie') {
    const handleClick = (e) => {
      e.preventDefault()
      toggleEmaChat(true)
      if (rest.onClick) {
        rest.onClick(e)
      }
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cx('btn', link.styles?.style, {
          'is-large': link.styles?.isLarge,
          'is-block': link.styles?.isBlock,
        })}
        {...rest}
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
