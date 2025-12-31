import React, { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Icon from '@components/icon'
import cx from 'classnames'
import { useEmaChat } from '@lib/context'

const EmaFixedInput = () => {
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

    let searchResults = []

    try {
      // 1. Always search Algolia for relevant articles
      try {
        const searchResponse = await fetch('/api/ema/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: question }),
        })

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          searchResults = searchData.hits || []
        } else {
          console.warn('Algolia search returned non-OK status:', searchResponse.status)
        }
      } catch (searchError) {
        console.error('Error searching Algolia:', searchError)
        // Continue even if search fails - searchResults will be empty array
      }

      // 2. Store the initial search query and trigger chat open
      const truncatedQuery =
        question.length > 50 ? question.substring(0, 50) + '...' : question

      // Dispatch event to open Ema chat with the question and search results
      window.dispatchEvent(
        new CustomEvent('ema-open-chat', {
          detail: {
            question,
            searchQuery: truncatedQuery,
            searchResults, // Always include searchResults, even if empty
          },
        })
      )

      setFixedInputText('')
      // Reset textarea height
      if (fixedInputRef.current) {
        fixedInputRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      // Even on error, try to open chat with empty search results
      const truncatedQuery =
        question.length > 50 ? question.substring(0, 50) + '...' : question
      window.dispatchEvent(
        new CustomEvent('ema-open-chat', {
          detail: {
            question,
            searchQuery: truncatedQuery,
            searchResults: [], // Empty results on error
          },
        })
      )
      setFixedInputText('')
      if (fixedInputRef.current) {
        fixedInputRef.current.style.height = 'auto'
      }
    } finally {
      setIsSubmitting(false)
    }
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
              placeholder="How can Julie help?"
              rows={1}
              value={fixedInputText}
              onChange={(e) => {
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
                  'pl-35': fixedInputText.trim().length === 0,
                  'pl-15': fixedInputText.trim().length > 0,
                }
              )}
              aria-label="Chat message input"
              onKeyDown={(e) => {
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

