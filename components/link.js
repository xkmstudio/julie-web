import React from 'react'
import NextLink from 'next/link'
import cx from 'classnames'

import Icon from '@components/icon'

import { getStaticRoute, getDynamicRoute } from '@lib/routes'

const Link = ({ link, children, hasArrow = false, ...rest }) => {
  if (!link) return null

  const isLink = !!link.url
  const isAnchor = link.anchor != null || link.anchor != undefined
  const isStatic = getStaticRoute(link.page?.type)

  // External Link
  if (isLink) {
    return (
      <a
        href={link.url}
        target={!link.url.match('^mailto:') ? '_blank' : null}
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
    // Internal Page
  } else {
    const isDynamic = getDynamicRoute(link.page?.type)
    const isHome = link.page?.isHome

    return (
      <NextLink
        href={
          isHome
            ? '/'
            : isStatic !== false
            ? `/${isStatic}`
            : `/${isDynamic ? `${isDynamic}/` : ''}${link.page?.slug}${
                isAnchor
                  ? `#${link.anchor.toLowerCase().replace(/\s+/g, '-')}`
                  : ''
              }`
        }
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
}

export default Link
