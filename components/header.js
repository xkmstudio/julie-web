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
import Menu3D from '@components/menu-3d'

import { useSiteContext, useToggleCart, useCartCount } from '@lib/context'

import { useWindowSize } from '@lib/helpers'

const Header = ({ data, work, pages }) => {
  if (!data) return

  const { width } = useWindowSize()

  const { nav, navSecondary } = data
  const menuPages = pages || work?.pages || []
  const router = useRouter()
  const headerRef = useRef()
  const burgerRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menu3DOpen, setMenu3DOpen] = useState(false)
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
    window.addEventListener('scroll', checkScrollAndHeroBleed, { passive: true })

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
          'fixed z-[91] flex top-0 left-0 justify-between w-full px-25 pt-20 text-white',
        )}
      >
        <div className={cx(`header relative w-full flex justify-between items-center px-15 py-10 rounded-full`,
          { 'is-transparent': isTransparent }
        )}>
          <div className="flex gap-15 items-center font-lxb">
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
          <div className="flex">
            <div className="col-span-3 col-start-9 fixed md:relative top-0 right-10 md:right-0 flex items-center gap-15">
              <div className="flex md:hidden items-center gap-20">
                <button
                  ref={burgerRef}
                  onClick={() => {
                    setMenuOpen(!menuOpen)
                  }}
                  aria-label={menuOpen ? 'close menu' : 'open menu'}
                  className={cx('w-[2rem] nav-toggle px-0 mb-3')}
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
                      strokeWidth=".751"
                      strokeLinecap="square"
                      strokeLinejoin="square"
                    />
                    <path
                      className="menu_line menu_line_two"
                      d="M1 5H11"
                      stroke="currentColor"
                      strokeWidth=".75"
                      strokeLinecap="square"
                      strokeLinejoin="square"
                    />
                    <path
                      className="menu_line menu_line_three"
                      d="M1 9H11"
                      stroke="currentColor"
                      strokeWidth=".75"
                      strokeLinecap="square"
                      strokeLinejoin="square"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-15 items-center font-lxb">
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
                className="absolute left-0 top-0 w-full h-full bg-[rgba(255,255,255,.1)] backdrop-blur-[60px]"
              ></m.button>
              <m.nav
                key={'navbg'}
                initial={'closed'}
                animate={'open'}
                exit="closed"
                variants={menuAnim}
                transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
                className="w-full bg-white pt-100"
              >
                <div className="flex flex-col">
                  {nav?.map((link, key) => {
                    return (
                      <Link
                        onClick={() => {
                          setModalActive(link._key)
                          setMenuOpen(false)
                        }}
                        className={
                          'uppercase leading-100 w-full flex items-center justify-between border-b border-cement p-10'
                        }
                        hasArrow={true}
                        key={key}
                        link={link}
                      />
                    )
                  })}
                </div>
                <div className="flex w-full justify-between mt-50 p-10">
                  <div className="flex gap-5">
                    <span>© {new Date().getFullYear()} Julie Products Inc</span>
                  </div>

                  <a
                    className="link-text"
                    href="https://xkm.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Site Credits</span>
                  </a>
                </div>
              </m.nav>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>
      <Menu3D
        isOpen={menu3DOpen}
        onClose={() => setMenu3DOpen(false)}
        pages={menuPages}
      />
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
      <div className='relative w-[2rem] -translate-y-3'>
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
