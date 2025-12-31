import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import cx from 'classnames'

import NextLink from 'next/link'

import FocusTrap from 'focus-trap-react'
import { m } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { backgroundAnim, menuAnim } from '@lib/animate'

import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)

import Marquee from '@components/modules/marquee'
import Icon from '@components/icon'
import Link from '@components/link'

import { useSiteContext, useToggleCart, useCartCount } from '@lib/context'

import { useWindowSize } from '@lib/helpers'
import EmaFixedInput from '@components/emaFixedInput'

const Header = ({ data, work, pages }) => {
  if (!data) return

  const { width } = useWindowSize()

  const { nav, navSecondary } = data
  const menuPages = pages || work?.pages || []
  const router = useRouter()
  const headerRef = useRef()
  const burgerRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [isTransparent, setIsTransparent] = useState(false)

  useEffect(() => {
    document.body.style.setProperty(
      '--headerHeight',
      `${headerRef?.current?.offsetHeight}px`
    )
  }, [width])

  //handle menu state on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [router])

  // Check for hero-bleed element and update header transparency based on scroll
  useEffect(() => {
    const checkScrollAndHeroBleed = () => {
      const hasHeroBleed = document.querySelector('.hero-bleed') !== null
      const scrollY = window.scrollY || window.pageYOffset

      if (hasHeroBleed && scrollY < 100) {
        setIsTransparent(true)
      } else {
        setIsTransparent(false)
      }
    }

    // Check on mount and route changes
    checkScrollAndHeroBleed()

    // Add scroll listener
    window.addEventListener('scroll', checkScrollAndHeroBleed, {
      passive: true,
    })

    // Re-check when route changes (after a short delay to allow DOM to update)
    const handleRouteChange = () => {
      setTimeout(() => {
        checkScrollAndHeroBleed()
      }, 100)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      window.removeEventListener('scroll', checkScrollAndHeroBleed)
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to Content
      </a>

      <header
        ref={headerRef}
        className={cx(
          'fixed z-[91] flex top-0 left-0 justify-between w-full px-15 md:px-25 pt-20 text-white'
        )}
      >
        <div
          className={cx(
            `header relative w-full flex justify-between items-center px-15 py-10 rounded-full`,
            { 'is-transparent': isTransparent && !menuOpen }
          )}
        >
          <div className="hidden md:flex gap-15 items-center font-lxb">
            {nav?.map((item, index) => (
              <div key={index} className={`flex`}>
                <Link key={index} link={item} className={``} />
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-start">
              <NextLink className="h-35" href={`/`}>
                <Icon name="Logo" viewBox="0 0 543 265" />
              </NextLink>
            </div>
          </div>
          <div className="flex w-full md:w-[unset]">
            <div className="flex justify-between w-full gap-15">
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen)
                }}
                className="flex md:hidden items-center justify-center w-[3.5rem] h-[3.5rem] rounded-full bg-pink"
              >
                <div
                  ref={burgerRef}
                  aria-label={menuOpen ? 'close menu' : 'open menu'}
                  className={cx('w-[1.8rem] nav-toggle px-0 mb-1')}
                >
                  <svg
                    className={cx('menu_svg', { 'is-open': menuOpen })}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      className="menu_line menu_line_one"
                      d="M1 1H11"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className="menu_line menu_line_two"
                      d="M1 5H11"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className="menu_line menu_line_three"
                      d="M1 9H11"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
              <div className="hidden md:flex gap-15 items-center font-lxb">
                {navSecondary?.map((item, index) => (
                  <div key={index} className={`flex`}>
                    <Link key={index} link={item} className={``} />
                  </div>
                ))}
              </div>
              <CartToggle />
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence initial={false}>
        {menuOpen && (
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              preventScroll: true,
            }}
            active={menuOpen}
          >
            <div className="fixed top-0 left-0 w-full h-full z-9">
              <m.button
                key={'navmenu'}
                initial={'closed'}
                animate={'open'}
                exit="closed"
                variants={backgroundAnim}
                transition={{ duration: 0.7, ease: [0.19, 1.0, 0.22, 1.0] }}
                aria-label="Close Menu"
                className="absolute left-0 top-0 w-full h-full bg-[rgba(0,0,0,.7)]"
              ></m.button>
              <m.nav
                key={'navbg'}
                initial={'closed'}
                animate={'open'}
                exit="closed"
                variants={menuAnim}
                transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
                className="w-full bg-pink text-white pt-100"
              >
                <div className="flex flex-col gap-10 pb-30">
                  {nav?.map((link, key) => {
                    return (
                      <Link
                        onClick={() => {
                          setModalActive(link._key)
                          setMenuOpen(false)
                        }}
                        className={
                          'title-2xl leading-100 w-full flex items-center justify-center text-center px-35 border-white'
                        }
                        hasArrow={false}
                        key={key}
                        link={link}
                      />
                    )
                  })}
                  {navSecondary?.map((link, key) => {
                    return (
                      <Link
                        onClick={() => {
                          setModalActive(link._key)
                          setMenuOpen(false)
                        }}
                        className={
                          'title-2xl leading-100 w-full flex items-center justify-center text-center px-35 border-white'
                        }
                        hasArrow={false}
                        key={key}
                        link={link}
                      />
                    )
                  })}
                </div>
              </m.nav>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>

      {/* Ema Fixed Input - Appears after scrolling 500px */}
      <EmaFixedInput />
    </>
  )
}

const CartToggle = () => {
  const toggleCart = useToggleCart()
  const cartCount = useCartCount()

  return (
    <button
      className="cart-toggle w-[3.5rem] h-[3.5rem] flex items-center justify-center bg-white rounded-full"
      onClick={() => {
        toggleCart()
      }}
    >
      <div className="relative w-[2rem] -translate-y-3">
        <div className="w-[2rem] text-pink">
          <Icon name="Cart" viewBox="0 0 20 22" />
        </div>
        <span className="absolute leading-[1] left-1/2 bottom-[.2rem] -translate-x-1/2 flex items-center text-white font-lxb text-[1.2rem]">
          <span
            className={cx('cart-toggle--count', {
              'is-active': cartCount > 0,
            })}
          >
            {cartCount}
          </span>
        </span>
      </div>
    </button>
  )
}

export default Header
