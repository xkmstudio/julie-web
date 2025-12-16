import React, { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { AnimatePresence, m } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import { useRouter } from 'next/router'
import cx from 'classnames'

import MenuScene from './menu-scene'
import { useWindowSize } from '@lib/helpers'

const Menu3D = ({ isOpen, onClose, pages = [] }) => {
  const router = useRouter()
  const { width } = useWindowSize()
  const isDesktop = width >= 950

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = null
    }

    return () => {
      document.documentElement.style.overflow = null
    }
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen])

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [router.asPath])

  if (!isDesktop) {
    return null // Only show on desktop
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap
          focusTrapOptions={{
            allowOutsideClick: true,
            preventScroll: true,
          }}
          active={isOpen}
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose()
              }
            }}
          >
            <div className="absolute inset-0">
              <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                className="w-full h-full"
              >
                <Suspense fallback={null}>
                  <MenuScene pages={pages} onNavigate={onClose} />
                </Suspense>
              </Canvas>
            </div>
            <button
              onClick={onClose}
              className="absolute top-10 right-10 md:top-15 md:right-15 z-10 w-40 h-40 md:w-50 md:h-50 flex items-center justify-center text-black uppercase font-vm"
              aria-label="Close menu"
            >
              ×
            </button>
          </m.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  )
}

export default Menu3D

