import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import useEmblaCarousel from 'embla-carousel-react'
import Icon from '@components/icon'
import Image from 'next/image'
import { useWindowSize } from '@lib/helpers'
import PageContent from '@components/page-content'
import cx from 'classnames'
import Gradient from '@components/gradient'
import { useSiteContext } from '@lib/context'

const MOBILE_BREAKPOINT = 850

const frameTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
}

// Helper function to check if a URL is internal (juliecare.co)
const isInternalLink = (url) => {
  if (!url) return false
  if (url.startsWith('/')) return true
  try {
    if (typeof window !== 'undefined') {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.hostname === 'juliecare.co' || urlObj.hostname === window.location.hostname
    }
    const urlObj = new URL(url, 'https://juliecare.co')
    return urlObj.hostname === 'juliecare.co'
  } catch (e) {
    return false
  }
}

// Bold processing
const processBold = (text, startKey = 0) => {
  if (!text || typeof text !== 'string') return text

  const parts = []
  const boldRegex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match
  let key = startKey

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      if (beforeText) parts.push(beforeText)
    }
    parts.push(
      <strong key={`bold-${key++}`} className="font-bold">
        {match[1]}
      </strong>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    if (remaining) parts.push(remaining)
  }

  return parts.length > 0 ? parts : [text]
}

// Convert markdown links + bare urls into clickable elements
const processMessageLinks = (text, onOpenFrame) => {
  if (!text || typeof text !== 'string') return [text]

  const elements = []
  let currentIndex = 0
  let elementKey = 0

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links = []
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      start: match.index,
      end: match.index + match[0].length,
      linkText: match[1],
      url: match[2],
      type: 'markdown',
    })
  }

  const urlRegex = /(https?:\/\/[^\s\)]+)/g
  const plainUrls = []
  urlRegex.lastIndex = 0

  while ((match = urlRegex.exec(text)) !== null) {
    const isInLink = links.some((link) => match.index >= link.start && match.index < link.end)
    if (!isInLink) {
      plainUrls.push({
        start: match.index,
        end: match.index + match[0].length,
        url: match[0],
        type: 'url',
      })
    }
  }

  const allLinks = [...links, ...plainUrls].sort((a, b) => a.start - b.start)

  allLinks.forEach((link) => {
    if (link.start > currentIndex) {
      const beforeText = text.substring(currentIndex, link.start)
      const boldProcessed = processBold(beforeText, elementKey)
      if (Array.isArray(boldProcessed)) {
        elements.push(...boldProcessed)
        elementKey += boldProcessed.length
      } else {
        elements.push(boldProcessed)
        elementKey++
      }
    }

    const url = link.type === 'markdown' ? link.url : link.url
    const isInternal = isInternalLink(url)

    if (link.type === 'markdown') {
      const linkTextBold = processBold(link.linkText, elementKey)

      if (isInternal && onOpenFrame) {
        elements.push(
          <button
            key={`btn-${elementKey++}`}
            onClick={(e) => {
              e.preventDefault()
              onOpenFrame(url)
            }}
            className="underline hover:no-underline text-current cursor-pointer bg-transparent border-none p-0"
            type="button"
          >
            {linkTextBold}
          </button>
        )
      } else {
        elements.push(
          <a
            key={`a-${elementKey++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-current"
          >
            {linkTextBold}
          </a>
        )
      }
    } else {
      if (isInternal && onOpenFrame) {
        elements.push(
          <button
            key={`btn-url-${elementKey++}`}
            onClick={(e) => {
              e.preventDefault()
              onOpenFrame(url)
            }}
            className="underline hover:no-underline text-current cursor-pointer bg-transparent border-none p-0"
            type="button"
          >
            {url}
          </button>
        )
      } else {
        elements.push(
          <a
            key={`url-${elementKey++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-current"
          >
            {url}
          </a>
        )
      }
    }

    currentIndex = link.end
  })

  if (currentIndex < text.length) {
    const remaining = text.substring(currentIndex)
    const boldProcessed = processBold(remaining, elementKey)
    if (Array.isArray(boldProcessed)) elements.push(...boldProcessed)
    else elements.push(boldProcessed)
  }

  if (allLinks.length === 0) {
    const boldProcessed = processBold(text, 0)
    return Array.isArray(boldProcessed) ? boldProcessed : [boldProcessed]
  }

  return elements.length > 0 ? elements : [text]
}

/**
 * iOS-safe scroll lock:
 * - prevents the "page pushes up" effect
 * - preserves/restores scroll position
 */
const lockDocumentScroll = () => {
  const docEl = document.documentElement
  const body = document.body

  const scrollY = window.scrollY || window.pageYOffset || 0

  const prev = {
    docOverflow: docEl.style.overflow,
    docHeight: docEl.style.height,
    docOverscroll: docEl.style.overscrollBehavior,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverflow: body.style.overflow,
    bodyHeight: body.style.height,
    bodyOverscroll: body.style.overscrollBehavior,
    bodyTouchAction: body.style.touchAction,
  }

  // Lock
  docEl.style.overflow = 'hidden'
  docEl.style.height = '100%'
  docEl.style.overscrollBehavior = 'none'

  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  body.style.height = '100%'
  body.style.overscrollBehavior = 'none'
  body.style.touchAction = 'none'

  return () => {
    // Restore
    docEl.style.overflow = prev.docOverflow
    docEl.style.height = prev.docHeight
    docEl.style.overscrollBehavior = prev.docOverscroll

    body.style.position = prev.bodyPosition
    body.style.top = prev.bodyTop
    body.style.left = prev.bodyLeft
    body.style.right = prev.bodyRight
    body.style.width = prev.bodyWidth
    body.style.overflow = prev.bodyOverflow
    body.style.height = prev.bodyHeight
    body.style.overscrollBehavior = prev.bodyOverscroll
    body.style.touchAction = prev.bodyTouchAction

    // Jump back to previous scroll position
    const top = prev.bodyTop ? parseInt(prev.bodyTop, 10) : 0
    // when locked, bodyTop is negative scrollY; we restore scrollY from it
    window.scrollTo(0, scrollY)

    // (top var unused; keep logic simple and deterministic)
    void top
  }
}

/**
 * Keyboard tracking:
 * Set --composer-bottom (px from viewport bottom) so the composer can be
 * position:fixed; bottom: var(--composer-bottom) and stay just above the keyboard.
 */
const setupKeyboardTracking = (overlayEl) => {
  const vv = window.visualViewport
  if (!vv || !overlayEl) return () => { }

  const update = () => {
    const keyboardCover =
      vv.height > 50
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0
    overlayEl.style.setProperty('--composer-bottom', `${keyboardCover}px`)
  }

  const onFocusIn = () => {
    update()
    // iOS often resizes viewport after focus; re-run so composer stays above keyboard
    setTimeout(update, 100)
    setTimeout(update, 300)
  }

  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
  window.addEventListener('orientationchange', update)
  overlayEl.addEventListener('focusin', onFocusIn)

  update()

  return () => {
    vv.removeEventListener('resize', update)
    vv.removeEventListener('scroll', update)
    window.removeEventListener('orientationchange', update)
    overlayEl.removeEventListener('focusin', onFocusIn)
  }
}

/**
 * iOS sometimes tries to scroll on focus. With scroll lock it *shouldn't*,
 * but this adds an extra safety snap-back.
 */
const preventIosFocusScrollJump = () => {
  let lastY = 0

  const onFocusIn = () => {
    lastY = window.scrollY
    requestAnimationFrame(() => window.scrollTo(0, lastY))
    setTimeout(() => window.scrollTo(0, lastY), 0)
    setTimeout(() => window.scrollTo(0, lastY), 50)
  }

  window.addEventListener('focusin', onFocusIn)
  return () => window.removeEventListener('focusin', onFocusIn)
}

/** Mobile-only horizontal carousel of Algolia articles, shown after the first assistant message */
function EmaArticlesCarousel({ articles, onOpenFrame }) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
  })

  return (
    <div className="w-full overflow-hidden mt-20 md:mt-0">
      <div ref={emblaRef} className="overflow-hidden touch-pan-x px-15">
        <div className="flex gap-15">
          {articles.map((article, index) => (
            <button
              key={article.slug || index}
              onClick={() => onOpenFrame(`/blog/${article.slug}`)}
              className="article-card-container flex-[0_0_75%] min-w-0 flex-shrink-0 block group w-full text-left"
              type="button"
            >
              <div className="article-card relative w-full pb-[80%] rounded-[1rem] overflow-hidden">
                {!article.useGradient && article.image ? (
                  <div className="absolute inset-0">
                    <Image
                      src={article.image.url || article.image}
                      alt={article.image.alt || article.title}
                      fill
                      className="object-cover"
                      sizes="75vw"
                      placeholder={article.image.lqip ? 'blur' : undefined}
                      blurDataURL={article.image.lqip}
                    />
                  </div>
                ) : article.useGradient ? (
                  <div className="absolute inset-0">
                    <Gradient gradient={article.gradient} />
                  </div>
                ) : null}

                <div
                  className={cx('p-15 absolute bottom-0 left-0 w-full', {
                    'bg-gradient-to-t from-black to-transparent text-white': !article.useGradient,
                    'text-black': article.useGradient,
                  })}
                >
                  {article.authors && article.authors.length > 0 && (
                    <div className={cx('text-12 mb-5', {
                      'text-gray-300': !article.useGradient,
                      'text-black/70': article.useGradient,
                    })}>
                      by {article.authors[0]?.title || article.authors[0]?.name}
                    </div>
                  )}
                  <h4 className={cx('text-16 font-lb line-clamp-2', {
                    'text-white': !article.useGradient,
                    'text-black': article.useGradient,
                  })}>
                    {article.title}
                  </h4>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const EmaChat = ({ onClose = null }) => {
  // Local state for chat - not using context since this is a dedicated page
  // Initialize with empty state to avoid hydration mismatches
  const [messages, setMessages] = useState([])
  const [emaUserId, setEmaUserId] = useState(null)
  const [initialSearchQuery, setInitialSearchQuery] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const { ema: emaSettings } = useSiteContext()

  // Load persisted state from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true)

    try {
      const savedMessages = localStorage.getItem('emaChatMessages')
      const savedUserId = localStorage.getItem('emaChatUserId')
      const savedQuery = localStorage.getItem('emaChatInitialQuery')

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
      if (savedUserId) {
        setEmaUserId(savedUserId)
      }
      if (savedQuery) {
        setInitialSearchQuery(savedQuery)
      }
    } catch (error) {
      console.error('Error loading persisted chat state:', error)
    }
  }, [])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false)
  const [frameOpen, setFrameOpen] = useState(false)
  const [frameUrl, setFrameUrl] = useState(null)
  const [frameContent, setFrameContent] = useState(null)
  const [frameLoading, setFrameLoading] = useState(false)
  const [chatInputText, setChatInputText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(null) // messageId for which feedback form is open
  const [feedbackReason, setFeedbackReason] = useState('')
  const [feedbackDescription, setFeedbackDescription] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState(null) // { messageId, message }
  const [composerHeightPx, setComposerHeightPx] = useState(120) // reserve space so last message isn't behind input

  const { width } = useWindowSize()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const router = useRouter()

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('emaChatMessages', JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving messages to localStorage:', error)
    }
  }, [messages])

  // Persist userId to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !emaUserId) return
    try {
      localStorage.setItem('emaChatUserId', emaUserId)
    } catch (error) {
      console.error('Error saving userId to localStorage:', error)
    }
  }, [emaUserId])

  // Persist initial search query to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !initialSearchQuery) return
    try {
      localStorage.setItem('emaChatInitialQuery', initialSearchQuery)
    } catch (error) {
      console.error('Error saving initial query to localStorage:', error)
    }
  }, [initialSearchQuery])

  // Update title when query parameter changes (even if we don't send it)
  useEffect(() => {
    if (!router.isReady) return
    const { q } = router.query
    if (q && typeof q === 'string') {
      const truncatedQuery = q.length > 50 ? q.substring(0, 50) + '...' : q
      setInitialSearchQuery(truncatedQuery)
    }
  }, [router.isReady, router.query])

  // Auto-send question from query parameter (even if messages exist - continuous thread)
  useEffect(() => {
    if (!router.isReady || !isHydrated) return
    const { q } = router.query

    // Only send if we have a query and it's different from the last one we sent
    if (q && typeof q === 'string' && q !== lastSentQueryRef.current && emaUserId) {
      // Mark this query as sent to avoid duplicates
      lastSentQueryRef.current = q

      // Fetch Algolia search results
      const fetchSearchResults = async () => {
        try {
          const searchResponse = await fetch('/api/ema/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q }),
          })
          if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            const hits = searchData.hits || []
            setSearchResults(hits)
          } else {
            const errorData = await searchResponse.json().catch(() => ({}))
            console.error('Search response not ok:', searchResponse.status, errorData)
          }
        } catch (error) {
          console.error('Error fetching search results:', error)
        }
      }
      fetchSearchResults()

      // Send the message - this will add to the existing conversation thread
      sendMessage(q)
    }
  }, [router.isReady, router.query, emaUserId, isHydrated])

  const chatContainerRef = useRef(null)
  const overlayRef = useRef(null)
  const chatInputRef = useRef(null)
  const composerRef = useRef(null)
  const titleRef = useRef(null)
  const titleContainerRef = useRef(null)
  const lastSentQueryRef = useRef(null) // Track last sent query to avoid duplicates
  const firstResponseIdOfThisSessionRef = useRef(null) // First assistant message created this visit (for mobile article carousel)

  // -------- Frame open/close ----------
  const handleOpenFrame = async (url, updateUrl = true) => {
    setFrameLoading(true)
    setFrameOpen(true)

    let pathname = url
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url)
        pathname = urlObj.pathname
      } catch (e) {
        pathname = url
      }
    }

    const normalizedUrl = url.startsWith('/')
      ? typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url
      : url

    setFrameUrl(normalizedUrl)

    if (updateUrl && typeof window !== 'undefined') {
      const currentQuery = { ...router.query }
      currentQuery.emaFrame = pathname

      router.replace(
        { pathname: router.pathname, query: currentQuery },
        undefined,
        { shallow: true, scroll: false }
      )
    }

    try {
      const response = await fetch('/api/ema/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (response.ok) {
        const result = await response.json()
        setFrameContent(result)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch content:', response.status, errorData)
        setFrameContent(null)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      setFrameContent(null)
    } finally {
      setFrameLoading(false)
    }
  }

  const handleCloseFrame = (updateUrl = true) => {
    setFrameOpen(false)
    setFrameUrl(null)
    setFrameContent(null)

    if (updateUrl && typeof window !== 'undefined') {
      const currentQuery = { ...router.query }
      delete currentQuery.emaFrame

      router.replace(
        { pathname: router.pathname, query: currentQuery },
        undefined,
        { shallow: true, scroll: false }
      )
    }
  }

  // Sync frame state with query parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const { emaFrame } = router.query
    if (emaFrame && typeof emaFrame === 'string' && !frameOpen) {
      handleOpenFrame(emaFrame, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await fetch('/api/ema/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createUser' }),
        })

        if (response.ok) {
          const userData = await response.json()
          const userId = userData.userId || userData._id || userData.id
          if (userId) setEmaUserId(userId)
          else console.error('No userId found in response:', userData)
        }
      } catch (error) {
        console.error('Error initializing user:', error)
      }
    }

    if (!emaUserId) initializeUser()
  }, [emaUserId, setEmaUserId])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isThinking, isStreaming])

  // Auto-resize chat input
  useEffect(() => {
    if (!chatInputRef.current) return

    const textarea = chatInputRef.current
    const adjustHeight = () => {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 30 * 16
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.height = `${scrollHeight}px`
        textarea.style.overflowY = 'hidden'
      }
    }

    textarea.addEventListener('input', adjustHeight)
    adjustHeight()

    return () => textarea.removeEventListener('input', adjustHeight)
  }, [])

  // Auto-focus input when chat opens
  useEffect(() => {
    if (!chatInputRef.current) return
    const t = setTimeout(() => {
      chatInputRef.current?.focus()
    }, 300)
    return () => clearTimeout(t)
  }, [])

  // Check if title overflows and needs animation
  useEffect(() => {
    if (!titleRef.current || !titleContainerRef.current) return

    const checkOverflow = () => {
      const titleWidth = titleRef.current?.scrollWidth || 0
      const containerWidth = titleContainerRef.current?.offsetWidth || 0
      const needsAnimation = titleWidth > containerWidth
      setShouldAnimateTitle(needsAnimation)

      if (needsAnimation && titleRef.current) {
        titleRef.current.style.setProperty('--marquee-container-width', `${containerWidth}px`)
      }
    }

    const r = setTimeout(checkOverflow, 100)
    window.addEventListener('resize', checkOverflow)
    return () => {
      clearTimeout(r)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [initialSearchQuery])

  const handleFeedback = async (messageId, flagValue, messageUserId = null) => {
    // Use the userId from the message if available, otherwise use current emaUserId
    // This handles both new messages (with userId) and old messages (without userId)
    const userIdToUse = messageUserId || emaUserId

    // Validate inputs
    if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
      console.error('Invalid messageId:', messageId)
      alert('Unable to submit feedback: Invalid message ID')
      return
    }

    if (!userIdToUse || typeof userIdToUse !== 'string' || userIdToUse.trim() === '') {
      console.error('Invalid userId:', userIdToUse)
      alert('Unable to submit feedback: User session not found')
      return
    }

    if (isSubmittingFeedback) {
      return
    }

    // If removing feedback (flagValue is null), just update local state
    if (flagValue === null) {
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.messageId === messageId) {
            return {
              ...msg,
              flag: null,
            }
          }
          return msg
        })
      })
      setFeedbackFormOpen(null)
      setFeedbackReason('')
      setFeedbackDescription('')
      return
    }

    setIsSubmittingFeedback(true)

    try {
      const requestBody = {
        userId: userIdToUse,
        messageId: messageId,
        flag: {
          value: flagValue,
          reason: null,
          description: null,
        },
      }

      const response = await fetch('/api/ema/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        // Update the message flag state
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.messageId === messageId) {
              return {
                ...msg,
                flag: { value: flagValue },
              }
            }
            return msg
          })
        })

        // Show success message
        setFeedbackSuccessMessage({
          messageId: messageId,
          message: flagValue === 'good' ? 'Thank you for your feedback!' : 'Feedback removed',
        })

        // Hide success message after 3 seconds
        setTimeout(() => {
          setFeedbackSuccessMessage(null)
        }, 3000)

        // Close feedback form if it was open
        if (flagValue === 'good') {
          setFeedbackFormOpen(null)
          setFeedbackReason('')
          setFeedbackDescription('')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error submitting feedback:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        alert(`Failed to submit feedback: ${errorData.message || errorData.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(`Failed to submit feedback: ${error.message || 'Please try again.'}`)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleSubmitBadFeedback = async (messageId, messageUserId = null) => {
    // Use the userId from the message if available, otherwise use current emaUserId
    const userIdToUse = messageUserId || emaUserId

    if (!messageId || !userIdToUse || isSubmittingFeedback) return

    setIsSubmittingFeedback(true)

    try {
      const response = await fetch('/api/ema/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdToUse,
          messageId: messageId,
          flag: {
            value: 'bad',
            reason: feedbackReason.trim() || null,
            description: feedbackDescription.trim() || null,
          },
        }),
      })

      if (response.ok) {
        // Update the message flag state
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.messageId === messageId) {
              return {
                ...msg,
                flag: {
                  value: 'bad',
                  reason: feedbackReason.trim() || null,
                  description: feedbackDescription.trim() || null,
                },
              }
            }
            return msg
          })
        })

        // Show success message
        setFeedbackSuccessMessage({
          messageId: messageId,
          message: 'Thank you for your feedback!',
        })

        // Hide success message after 3 seconds
        setTimeout(() => {
          setFeedbackSuccessMessage(null)
        }, 3000)

        // Close feedback form
        setFeedbackFormOpen(null)
        setFeedbackReason('')
        setFeedbackDescription('')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error submitting feedback:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        alert(`Failed to submit feedback: ${errorData.message || errorData.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(`Failed to submit feedback: ${error.message || 'Please try again.'}`)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const sendMessage = async (message) => {
    if (!message?.trim() || !emaUserId) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Algolia articles are only fetched on first entry (router.query.q); keep existing results for follow-up messages
    setIsThinking(true)

    try {
      const emaResponse = await fetch('/api/ema/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          userId: emaUserId,
          message: message.trim(),
        }),
      })

      if (emaResponse.ok && emaResponse.body) {
        setIsThinking(false)
        setIsStreaming(true)

        const reader = emaResponse.body.getReader()
        const decoder = new TextDecoder()

        let assistantMessage = {
          id: Date.now() + 1,
          sender: 'assistant',
          message: '',
          timestamp: new Date().toISOString(),
          messageId: null, // Will be set when received from API
          userId: emaUserId, // Store the userId used to create this message
          flag: null, // Track feedback state
        }

        // Track first response of this session so we show article carousel after it (mobile)
        if (!firstResponseIdOfThisSessionRef.current) {
          firstResponseIdOfThisSessionRef.current = assistantMessage.id
        }

        setMessages((prev) => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              setIsStreaming(false)
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                console.error('Ema API error:', parsed)
                setIsStreaming(false)
                break
              }

              if (parsed.content && Array.isArray(parsed.content)) {
                const textContent = parsed.content.map((item) => item.text?.value || '').join('')

                if (textContent) {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMessage = updated[updated.length - 1]
                    if (lastMessage && lastMessage.sender === 'assistant') {
                      lastMessage.message += textContent
                    }
                    return updated
                  })
                }
              }

              if (parsed.messageId) {
                // Store the messageId from Ema API
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastMessage = updated[updated.length - 1]
                  if (lastMessage && lastMessage.sender === 'assistant') {
                    lastMessage.messageId = parsed.messageId
                  }
                  return updated
                })
                setIsStreaming(false)
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsThinking(false)
      setIsStreaming(false)
    }
  }

  const gradientStyle = {
    background:
      'linear-gradient(to bottom, #019AD7 0%, #ADF4FF 45%, #FEFFD8 74%, #FFFFFF 100%)',
  }

  // Inline styles to avoid needing external CSS edits
  // Overlay stays full height; only the composer moves (--kbd) so input stays above keyboard
  const overlayStyle = {
    ...gradientStyle,
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: frameOpen && !isMobile ? 'row' : 'column',
    // --composer-bottom set by setupKeyboardTracking (px from viewport bottom)
    // --composer-h set at runtime for messages paddingBottom
  }

  const messagesStyle = {
    flex: '1 1 auto',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    // Reserve space for the composer + safe area + keyboard translation doesn’t affect layout
    paddingBottom: `${isMobile ? 'calc(110px + ${composerHeightPx}px +env(safe-area-inset-bottom))' : '60px'})`,
  }

  const composerStyle = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 'var(--composer-bottom, 0px)',
    width: frameOpen && !isMobile ? '50%' : '100%',
    zIndex: 1001,
    background: 'transparent',
  }

  // Setup keyboard tracking and scroll lock
  useEffect(() => {
    if (!overlayRef.current) return

    const unlockScroll = lockDocumentScroll()
    const cleanupKeyboard = setupKeyboardTracking(overlayRef.current)
    const cleanupFocus = preventIosFocusScrollJump()

    return () => {
      unlockScroll()
      cleanupKeyboard()
      cleanupFocus()
    }
  }, [])

  // Measure composer height so messages area has enough padding at bottom (no content hidden behind input)
  const updateComposerHeight = () => {
    const height = composerRef.current?.offsetHeight
    const px = height != null && height > 0 ? Math.ceil(height) : 120
    setComposerHeightPx(px)
    if (overlayRef.current) overlayRef.current.style.setProperty('--composer-h', `${px}px`)
  }

  useLayoutEffect(() => {
    if (!composerRef.current) return
    updateComposerHeight()
    const t1 = setTimeout(updateComposerHeight, 50)
    const t2 = setTimeout(updateComposerHeight, 200)
    window.addEventListener('resize', updateComposerHeight)
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateComposerHeight)
        : null
    if (ro && composerRef.current) ro.observe(composerRef.current)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', updateComposerHeight)
      ro?.disconnect()
    }
  }, [messages, chatInputText])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Full-page chat experience */}
      <m.div
        ref={overlayRef}
        className="ema-chat-overlay"
        style={overlayStyle}
        role="main"
        aria-labelledby="ema-chat-title"
      >
        {/* Chat panel - overflow-visible so composer can translate above keyboard on mobile */}
        <m.div
          className="flex flex-col overflow-visible flex-shrink-0 min-w-0 h-full"
          initial={false}
          animate={{
            width: frameOpen && !isMobile ? '50%' : '100%',
          }}
          transition={frameTransition}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat Container: overflow-visible so composer can translate above keyboard without being clipped */}
          <div
            className="relative w-full h-full flex flex-col overflow-visible"
          >
            {/* Header */}
            <div className="absolute z-[101] top-0 left-0 w-full flex items-center justify-between p-15 md:p-30 pl-15 md:pl-0 pr-15 flex-shrink-0">
              <div className="flex items-center gap-10 flex-1 min-w-0 bg-pink md:bg-transparent rounded-full py-20 md:py-0 px-10 md:px-0">
                <div
                  ref={titleContainerRef}
                  className="flex-1 min-w-0 overflow-hidden max-w-full md:max-w-[calc(50vw-35rem)] relative px-10 md:px-25"
                >
                  <h2
                    ref={titleRef}
                    id="ema-chat-title"
                    className={`font-plaid text-white font-normal uppercase text-14 whitespace-nowrap ${shouldAnimateTitle ? 'animate-marquee' : ''
                      }`}
                  >
                    {initialSearchQuery &&
                      `new chat for: ${initialSearchQuery.toUpperCase()}`}
                  </h2>
                </div>
              </div>

              {!frameOpen && (
                <m.button
                  initial={{ opacity: 1 }}
                  animate={{ opacity: frameOpen ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (onClose) {
                      onClose()
                    }
                  }}
                  className="absolute top-18 md:top-25 right-15 md:right-25 z-[110] w-[4.5rem] md:w-[6rem] h-[4.5rem] md:h-[6rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-pink transition-colors focus:outline-none"
                  aria-label="Close chat"
                  type="button"
                >
                  <Icon
                    name="Close"
                    viewBox="0 0 22 22"
                    className="w-[1.6rem] md:w-[2.2rem] h-[1.6rem] md:h-[2.2rem]"
                  />
                </m.button>
              )}
            </div>

            {/* Messages (only scrollable region) */}
            <div
              ref={chatContainerRef}
              className="ema-chat-messages space-y-20 pt-80 md:pt-25"
              style={messagesStyle}
            >
              {messages.length === 0 && (
                <div className="max-w-[50rem] mx-auto">
                  Start a conversation with Julie AI...
                </div>
              )}

              {messages.map((msg, msgIndex) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[50rem] mx-auto ${msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                >
                  <div className='px-15 md:px-0 max-w-[100%] md:max-w-[80%]'>
                    <div
                      className={cx(
                        'w-full p-15 md:p-20 rounded-[1rem] rc',
                        {
                          'bg-white text-black': msg.sender === 'user',
                          'bg-transparent': msg.sender === 'assistant',
                        }
                      )}
                    >
                      <div className="text-14 md:text-16 whitespace-pre-wrap leading-relaxed">
                        {processMessageLinks(msg.message, handleOpenFrame)}
                      </div>
  
                      {isStreaming &&
                        msg.sender === 'assistant' &&
                        msg.id === messages[messages.length - 1]?.id && (
                          <span className="inline-block w-[0.5rem] h-[1rem] bg-current ml-5 animate-pulse" />
                        )}
                    </div>
                  </div>

                  {/* Feedback buttons for assistant messages */}
                  {msg.sender === 'assistant' &&
                    msg.messageId &&
                    !isStreaming && (
                      <div className="flex items-center gap-10 mt-10 px-15 md:px-0">
                        <button
                          onClick={() => handleFeedback(msg.messageId, 'good', msg.userId)}
                          disabled={isSubmittingFeedback || msg.flag?.value === 'good'}
                          className={cx(
                            'flex items-center gap-5 px-10 py-5 rounded-full text-12 transition-colors',
                            {
                              'bg-pink/20 text-pink': msg.flag?.value === 'good',
                              'bg-white/50 text-black hover:bg-white/70': msg.flag?.value !== 'good',
                              'opacity-50 cursor-not-allowed': isSubmittingFeedback,
                            }
                          )}
                          type="button"
                          aria-label="Good feedback"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H16.4262C17.907 22 19.1662 20.9194 19.3914 19.4682L20.4681 12.4682C20.7479 10.6559 19.3001 9 17.4629 9H14C13.4477 9 13 8.55228 13 8V4.46584C13 3.10399 11.896 2 10.5342 2C10.2093 2 9.91498 2.1913 9.78306 2.48812L7.26394 8.57843C7.09896 8.94958 6.74594 9.18943 6.35123 9.18943H4C2.89543 9.18943 2 10.0849 2 11.1894V13Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Helpful</span>
                        </button>

                        <button
                          onClick={() => {
                            if (msg.flag?.value === 'bad') {
                              setFeedbackFormOpen(null)
                              handleFeedback(msg.messageId, null, msg.userId) // Remove flag
                            } else {
                              setFeedbackFormOpen(msg.messageId)
                            }
                          }}
                          disabled={isSubmittingFeedback}
                          className={cx(
                            'flex items-center gap-5 px-10 py-5 rounded-full text-12 transition-colors',
                            {
                              'bg-pink/20 text-pink': msg.flag?.value === 'bad',
                              'bg-white/50 text-black hover:bg-white/70': msg.flag?.value !== 'bad',
                              'opacity-50 cursor-not-allowed': isSubmittingFeedback,
                            }
                          )}
                          type="button"
                          aria-label="Bad feedback"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17 2V13M22 11V4C22 2.89543 21.1046 2 20 2H7.57377C6.09299 2 4.83384 3.08058 4.60857 4.53178L3.53188 11.5318C3.25212 13.3441 4.69989 15 6.5371 15H10C10.5523 15 11 15.4477 11 16V19.5342C11 20.896 12.104 22 13.4658 22C13.7907 22 14.085 21.8087 14.2169 21.5119L16.7361 15.4216C16.901 15.0504 17.2541 14.8106 17.6488 14.8106H20C21.1046 14.8106 22 13.9151 22 12.8106V11Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{msg.flag?.value === 'bad' ? 'Not helpful (click to remove)' : 'Not helpful'}</span>
                        </button>
                      </div>
                    )}

                  {/* Success message after feedback submission */}
                  <AnimatePresence>
                    {feedbackSuccessMessage && feedbackSuccessMessage.messageId === msg.messageId && (
                      <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="mt-10 max-w-[100%] md:max-w-[80%] bg-pink/10 border border-pink/30 rounded-[1rem] px-15 py-10"
                      >
                        <div className="flex items-center gap-10">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                          >
                            <path
                              d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 11L3 7L4.41 5.59L7 8.17L11.59 3.58L13 5L7 11Z"
                              fill="currentColor"
                              className="text-pink"
                            />
                          </svg>
                          <span className="text-12 text-pink font-medium">
                            {feedbackSuccessMessage.message}
                          </span>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback form for bad feedback */}
                  {msg.sender === 'assistant' &&
                    msg.messageId &&
                    feedbackFormOpen === msg.messageId && (
                      <div className="mt-10 max-w-[100%] md:max-w-[80%] bg-white rounded-[1rem] p-15 md:p-20">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmitBadFeedback(msg.messageId, msg.userId)
                          }}
                          className="space-y-10"
                        >
                          <div>
                            <label className="block text-12 font-medium text-black mb-5">
                              Reason (optional)
                            </label>
                            <input
                              type="text"
                              value={feedbackReason}
                              onChange={(e) => setFeedbackReason(e.target.value)}
                              placeholder="e.g., Inaccurate, Unhelpful, Off-topic"
                              className="w-full px-10 py-8 border border-pink rounded-[0.5rem] text-16 outline-none focus:ring-2 focus:ring-pink"
                            />
                          </div>

                          <div>
                            <label className="block text-12 font-medium text-black mb-5">
                              Description (optional)
                            </label>
                            <textarea
                              value={feedbackDescription}
                              onChange={(e) => setFeedbackDescription(e.target.value)}
                              placeholder="Tell us more about what was wrong..."
                              rows={3}
                              className="w-full px-10 py-8 border border-pink rounded-[0.5rem] text-16 outline-none focus:ring-2 focus:ring-pink resize-none"
                            />
                          </div>

                          <div className="flex gap-10">
                            <button
                              type="submit"
                              disabled={isSubmittingFeedback}
                              className="px-15 py-8 bg-pink text-white rounded-[0.5rem] text-14 font-medium hover:bg-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setFeedbackFormOpen(null)
                                setFeedbackReason('')
                                setFeedbackDescription('')
                              }}
                              disabled={isSubmittingFeedback}
                              className="px-15 py-8 bg-white border border-pink text-pink rounded-[0.5rem] text-14 font-medium hover:bg-pink/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                  {/* Mobile-only: article carousel after the first response of this visit (each time user enters chat) */}
                  {msg.sender === 'assistant' &&
                    msg.id === firstResponseIdOfThisSessionRef.current &&
                    searchResults.length > 0 &&
                    (msg.messageId || !isStreaming) && (
                      <div className="md:hidden w-full mt-20">
                        <div className='title-sm px-15'>suggested articles:</div>
                        <EmaArticlesCarousel articles={searchResults} onOpenFrame={handleOpenFrame} />
                      </div>
                    )}
                </div>
              ))}

              {isThinking && (
                <div className="flex max-w-[50rem] mx-auto justify-start">
                  <div className="max-w-[100%]md:max-w-[80%] p-15 md:p-20 rounded-[1rem] bg-transparent">
                    <div className="flex items-center gap-8">
                      <span className="text-14 text-black/70">Thinking</span>
                      <span
                        className="w-[0.5rem] h-[0.5rem] bg-black/70 rounded-full ema-thinking-dot"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-[0.5rem] h-[0.5rem] bg-black/70 rounded-full ema-thinking-dot"
                        style={{ animationDelay: '200ms' }}
                      />
                      <span
                        className="w-[0.5rem] h-[0.5rem] bg-black/70 rounded-full ema-thinking-dot"
                        style={{ animationDelay: '400ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <m.div
                animate={{ opacity: frameOpen ? 0 : 1 }}
                transition={frameTransition}
                className="hidden md:block absolute bottom-0 right-0 w-full md:w-[25rem] h-screen pb-25 pt-[10rem] overflow-y-auto flex-shrink-0 pointer-events-none z-[100]"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                }}
              >
                {/* Wrapper to align content to bottom when not overflowing */}
                <div className="min-h-full flex flex-col justify-end pointer-events-none">
                  <div className="w-full max-w-[50rem] mx-auto px-15 md:px-25">
                    <div className="space-y-10">
                      {searchResults.map((article, index) => (
                        <button
                          key={index}
                          onClick={() => handleOpenFrame(`/blog/${article.slug}`)}
                          className="article-card-container block group w-full text-left pointer-events-auto"
                          type="button"
                        >
                          <div className="article-card relative w-full h-[28rem]">
                            {(!article.useGradient && article.image) ? (
                              <div className="w-full h-full relative">
                                <Image
                                  src={article.image.url || article.image}
                                  alt={article.image.alt || article.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  placeholder={article.image.lqip ? 'blur' : undefined}
                                  blurDataURL={article.image.lqip}
                                />
                              </div>
                            ) : article.useGradient ? (
                              <div className="w-full h-full relative">
                                <Gradient gradient={article.gradient} />
                              </div>
                            ) : null}

                            <div
                              className={cx('p-15 absolute bottom-0 left-0 w-full', {
                                'bg-gradient-to-t from-black to-transparent text-white': !article.useGradient,
                                'text-black': article.useGradient,
                              })}
                            >
                              {article.authors && article.authors.length > 0 && (
                                <div className={cx('text-12 mb-5', {
                                  'text-gray-300': !article.useGradient,
                                  'text-black/70': article.useGradient,
                                })}>
                                  by {article.authors[0]?.title || article.authors[0]?.name}
                                </div>
                              )}
                              <h4 className={cx('text-16 font-lb line-clamp-2', {
                                'text-white': !article.useGradient,
                                'text-black': article.useGradient,
                              })}>
                                {article.title}
                              </h4>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>
            )}
          </div>
        </m.div>

        {/* Composer: fixed to viewport bottom, moves above keyboard via --composer-bottom */}
        <div
          ref={composerRef}
          className="ema-chat-composer px-15 md:px-0 pb-15"
          style={composerStyle}
        >
          <div
            className="max-w-[50rem] mx-auto w-full"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const textarea = chatInputRef.current
                const question = textarea?.value?.trim()
                if (!question) return

                textarea.value = ''
                textarea.style.height = 'auto'
                setChatInputText('')
                await sendMessage(question)
              }}
              className="flex gap-10 relative items-end w-full"
            >
              <m.div
                initial={{ opacity: 1 }}
                animate={{ opacity: chatInputText.trim().length > 0 ? 0 : 1 }}
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
                ref={chatInputRef}
                placeholder={emaSettings?.chatPlaceholder ?? "How can Julie help?"}
                rows={1}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className={cx(
                  'transition-all duration-300 flex-1 border border-pink rounded-[3rem] pr-[4.5rem] py-15 text-16 outline-none resize-none overflow-y-auto min-h-[4.5rem] max-h-[30rem] font-lm ema-gradient-placeholder bg-white',
                  {
                    'pl-35': chatInputText.trim().length === 0,
                    'pl-15': chatInputText.trim().length > 0,
                  }
                )}
                aria-label="Chat message input"
                inputMode="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
                onFocus={() => {
                  const el = chatContainerRef.current
                  if (!el) return
                  requestAnimationFrame(() => {
                    el.scrollTop = el.scrollHeight
                  })
                }}
              />

              <button
                type="submit"
                disabled={isStreaming}
                className="absolute right-10 bottom-10 w-[3rem] h-[3rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none"
                aria-label="Send message"
              >
                <Icon
                  name="Arrow Up"
                  viewBox="0 0 14 14"
                  className="w-[1.2rem] h-[1.2rem]"
                />
              </button>
            </form>
          </div>
        </div>

        {/* Page Frame Popup */}
        <AnimatePresence>
          {frameOpen && frameUrl && (
            <m.div
              initial={isMobile ? { x: '100%', opacity: 0 } : { width: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1, width: isMobile ? undefined : '50%' }}
              exit={isMobile ? { x: '100%', opacity: 0 } : { width: 0, opacity: 0 }}
              transition={frameTransition}
              className={cx(
                'relative top-0 h-full z-[1002] flex flex-col flex-shrink-0',
                {
                  'absolute right-0 w-full': isMobile,
                  'p-25': !isMobile,
                }
              )}
              style={!isMobile ? { minWidth: 0 } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Desktop close button: outside frame, so not inside overflow wrapper */}
              <button
                onClick={() => handleCloseFrame(true)}
                className={cx(
                  'absolute z-[99999] bg-pink rounded-full text-white hidden md:flex items-center justify-center hover:bg-pink/90 transition-colors focus:outline-none flex-shrink-0',
                  {
                    'top-15 right-15 w-[4.5rem] h-[4.5rem]': isMobile,
                    'left-0 -translate-x-full top-25 w-[6rem] h-[6rem]': !isMobile,
                  }
                )}
                aria-label="Close frame"
                type="button"
              >
                <div className='w-[1.6rem] md:w-[2rem] h-[1.6rem] md:h-[2rem] flex items-center justify-center'>
                  <Icon
                    name={isMobile ? 'Close' : 'Arrow'}
                    viewBox={isMobile ? '0 0 22 22' : '0 0 14 14'}
                  />
                </div>
              </button>

              {/* Wrapper with overflow-hidden so width animation clips content but not the close button */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="md:hidden absolute z-[9999] top-0 left-0 w-full px-15 md:px-0 pt-15 md:pt-0">
                  <div className="flex items-center justify-between p-20 rounded-full text-white bg-pink flex-shrink-0">
                    <button
                      onClick={() => handleCloseFrame(true)}
                      className="rounded-full flex md:hidden items-center justify-center flex-shrink-0 rotate-180"
                      aria-label="Close frame"
                      type="button"
                    >
                      <Icon
                        name={'Arrow'}
                        viewBox={'0 0 14 14'}
                        className={cx({
                          'w-[1.6rem] flex items-center justify-center': isMobile,
                        })}
                      />
                    </button>
                    <h3 className="text-14 font-plaid uppercase font-normal truncate flex-1 px-10 text-center">
                      {frameContent?.data?.page?.title ||
                        frameUrl.replace(/^https?:\/\/[^/]+/, '')}
                    </h3>
                  </div>
                </div>

                <div className="relative w-full flex-1 overflow-y-auto no-bar bg-white md:border border-pink md:rounded-[1.5rem] pt-90 md:pt-0 py-20 md:py-0">
                  {frameLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-16 text-gray-500">Loading...</div>
                    </div>
                  ) : frameContent && frameContent.data && frameContent.data.page ? (
                    <div className="ema-frame-mobile pt-[1.5rem] md:pt-[2rem]">
                      <PageContent
                        page={frameContent.data.page}
                        type={frameContent.type}
                        sanityConfig={{
                          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
                          dataset: process.env.NEXT_PUBLIC_SANITY_PROJECT_DATASET,
                        }}
                        isInFrame={true}
                        onFrameLinkClick={handleOpenFrame}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-16 text-gray-500">Content not found</div>
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  )
}

export default EmaChat
