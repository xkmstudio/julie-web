import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import EmaChat from '@components/emaChat'
import { getServerSideProps as getPageServerSideProps } from './index'

/**
 * Dedicated EMA Chat page
 * Clean full-screen chat experience without overlay positioning issues
 */
export default function EmaChatPage() {
  const router = useRouter()
  const scrollPositionRef = useRef(0)

  // Store scroll position before navigating away, then restore it
  const handleNavigateBack = () => {
    // Get the scroll position from sessionStorage (set when navigating TO this page)
    const scrollPos = typeof window !== 'undefined' 
      ? sessionStorage.getItem('emaChatReturnScroll') 
      : null
    
    const scrollY = scrollPos ? parseInt(scrollPos, 10) : null
    
    if (!scrollY) {
      // No saved scroll position, just navigate back
      if (router.query.from) {
        router.push(router.query.from, undefined, { scroll: false })
      } else {
        router.back()
      }
      return
    }
    
    // Save scroll position to sessionStorage with a special key that the target page can read
    // This allows the target page to restore scroll immediately on load
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('emaChatRestoreScroll', scrollY.toString())
      sessionStorage.setItem('emaChatRestoreRoute', router.query.from || window.location.pathname)
    }
    
    // Navigate back with scroll disabled
    if (router.query.from) {
      router.push(router.query.from, undefined, { scroll: false })
    } else {
      router.back()
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* The EmaChat component handles all the chat UI */}
      {/* We pass a close handler to it */}
      <ChatPageWrapper onClose={handleNavigateBack} />
    </div>
  )
}

/**
 * Wrapper to handle the chat experience with proper scroll restoration
 */
function ChatPageWrapper({ onClose }) {
  const router = useRouter()

  useEffect(() => {
    // When page loads, ensure body scrolling is locked
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      // Restore on unmount
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <EmaChat 
      onClose={onClose}
    />
  )
}

// Reuse server-side props from homepage to get site data
export { getPageServerSideProps as getServerSideProps }


