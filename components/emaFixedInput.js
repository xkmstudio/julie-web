import React, { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import Icon from '@components/icon'
import cx from 'classnames'
import { useEmaChat } from '@lib/context'

const EmaFixedInput = () => {
  const router = useRouter()
  const [showFixedInput, setShowFixedInput] = useState(false)
  const [fixedInputText, setFixedInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { emaChatOpen } = useEmaChat()
  const fixedInputRef = useRef(null)

  // Scroll detection for fixed input
  useEffect(() => {
    if (typeof window === 'undefined') return

    const footerElement = document.querySelector('footer')
    let footerInView = false

    // Use Intersection Observer to detect when footer is in view
    const footerObserver = footerElement
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              footerInView = entry.isIntersecting
              updateFixedInputVisibility()
            })
          },
          {
            threshold: 0.1, // Trigger when 10% of footer is visible
            rootMargin: '0px',
          }
        )
      : null

    if (footerElement && footerObserver) {
      footerObserver.observe(footerElement)
    }

    const updateFixedInputVisibility = () => {
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      const shouldShow = scrollY > 500 && !emaChatOpen && !footerInView
      setShowFixedInput(shouldShow)
    }

    const handleScroll = () => {
      updateFixedInputVisibility()
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    // Listen on both window and document
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    document.addEventListener('scroll', throttledHandleScroll, { passive: true })
    handleScroll() // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      document.removeEventListener('scroll', throttledHandleScroll)
      if (footerObserver && footerElement) {
        footerObserver.unobserve(footerElement)
      }
    }
  }, [emaChatOpen])

  const handleFixedInputSubmit = async (e) => {
    e.preventDefault()
    const question = fixedInputText?.trim()
    if (!question) return

    setIsSubmitting(true)

    try {
      // Save current scroll position to sessionStorage for restoration on back
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      sessionStorage.setItem('emaChatReturnScroll', scrollY.toString())

      // Navigate to the chat page with the question as a query parameter
      // Use shallow: false to ensure proper navigation, but it will be fast
      router.push({
        pathname: '/ema-chat',
        query: {
          q: question,
          from: router.asPath, // Save current route for back navigation
        },
      }, undefined, { shallow: false })

      // Don't clear text immediately - let the thinking animation show
      // The text will be cleared when navigation completes
    } catch (error) {
      console.error('Error navigating to chat:', error)
      setIsSubmitting(false)
    }
    // Note: We don't set isSubmitting to false here because navigation will unmount the component
  }

  return (
    <AnimatePresence>
      {showFixedInput && (
        <m.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 left-1/2 translate-x-[-50%] w-full max-w-[50rem] px-15 md:px-20 z-[9999]"
        >
          <form
            onSubmit={handleFixedInputSubmit}
            className="flex gap-10 relative items-end"
          >
            <m.div
              initial={{ opacity: 1 }}
              animate={{
                opacity: fixedInputText.trim().length > 0 ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-15 top-[1.5rem] w-[1.5rem] h-[1.5rem] flex-shrink-0 pointer-events-none"
            >
              <Icon
                name="star"
                viewBox="0 0 19 19"
                className="w-full h-full text-pink"
              />
            </m.div>
            <textarea
              ref={fixedInputRef}
              placeholder={isSubmitting ? "Thinking..." : "How can Julie help?"}
              rows={1}
              value={isSubmitting ? "Thinking..." : fixedInputText}
              disabled={isSubmitting}
              onChange={(e) => {
                if (isSubmitting) return
                setFixedInputText(e.target.value)
                // Auto-resize textarea
                const textarea = e.target
                textarea.style.height = 'auto'
                const scrollHeight = textarea.scrollHeight
                const maxHeight = 30 * 16 // 30rem in pixels
                if (scrollHeight > maxHeight) {
                  textarea.style.height = `100%`
                  textarea.style.overflowY = 'auto'
                } else {
                  textarea.style.height = `100%`
                  textarea.style.overflowY = 'hidden'
                }
              }}
              className={cx(
                'transition-all duration-300 flex-1 border border-pink rounded-[3rem] pr-[4.5rem] py-15 text-14 md:text-16 outline-none resize-none overflow-y-auto min-h-[4.5rem] max-h-[30rem] font-lm ema-gradient-placeholder bg-white',
                {
                  'pl-35': fixedInputText.trim().length === 0 && !isSubmitting,
                  'pl-15': fixedInputText.trim().length > 0 || isSubmitting,
                  'opacity-70 cursor-wait ema-thinking-text': isSubmitting,
                }
              )}
              aria-label="Chat message input"
              onKeyDown={(e) => {
                if (isSubmitting) {
                  e.preventDefault()
                  return
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.target.form?.requestSubmit()
                }
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !fixedInputText.trim()}
              className="absolute right-10 top-1/2 translate-y-[-50%] w-[3rem] h-[3rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-pink transition-colors flex-shrink-0 focus:outline-none"
              aria-label="Send message"
            >
              <Icon
                name="Arrow Up"
                viewBox="0 0 14 14"
                className="w-[1.2rem] h-[1.2rem]"
              />
            </button>
          </form>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export default EmaFixedInput

