import React, { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import { useRouter } from 'next/router'
import Icon from '@components/icon'
import NextLink from 'next/link'
import Image from 'next/image'
import { InPortal, useWindowSize } from '@lib/helpers'
import PageContent from '@components/page-content'
import cx from 'classnames'
import { useEmaChat } from '@lib/context'
import Gradient from '@components/gradient'

const MOBILE_BREAKPOINT = 950

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
      return (
        urlObj.hostname === 'juliecare.co' ||
        urlObj.hostname === window.location.hostname
      )
    }
    const urlObj = new URL(url, 'https://juliecare.co')
    return urlObj.hostname === 'juliecare.co'
  } catch (e) {
    return false
  }
}

// Helper function to process text and convert markdown to React elements
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
    const isInLink = links.some(
      (link) => match.index >= link.start && match.index < link.end
    )
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
    if (Array.isArray(boldProcessed)) {
      elements.push(...boldProcessed)
    } else {
      elements.push(boldProcessed)
    }
  }

  if (allLinks.length === 0) {
    const boldProcessed = processBold(text, 0)
    return Array.isArray(boldProcessed) ? boldProcessed : [boldProcessed]
  }

  return elements.length > 0 ? elements : [text]
}

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
      if (beforeText) {
        parts.push(beforeText)
      }
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
    if (remaining) {
      parts.push(remaining)
    }
  }

  return parts.length > 0 ? parts : [text]
}

const EmaChat = () => {
  const emaChatData = useEmaChat()
  const {
    emaChatOpen,
    emaChatMessages,
    emaUserId,
    emaSearchResults,
    emaInitialSearchQuery,
    toggleEmaChat,
    setEmaChatMessages,
    setEmaUserId,
    setEmaSearchResults,
    setEmaInitialSearchQuery,
  } = emaChatData

  // Ensure emaChatMessages is always an array
  const messages = Array.isArray(emaChatMessages) ? emaChatMessages : []

  const [isStreaming, setIsStreaming] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false)
  const [frameOpen, setFrameOpen] = useState(false)
  const [frameUrl, setFrameUrl] = useState(null)
  const [frameContent, setFrameContent] = useState(null)
  const [frameLoading, setFrameLoading] = useState(false)
  const [chatInputText, setChatInputText] = useState('')

  const { width } = useWindowSize()
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT
  const router = useRouter()

  const chatContainerRef = useRef(null)
  const overlayRef = useRef(null)
  const chatInputRef = useRef(null)
  const titleRef = useRef(null)
  const titleContainerRef = useRef(null)

  // Handler to open frame with URL
  const handleOpenFrame = async (url, updateUrl = true) => {
    setFrameLoading(true)
    setFrameOpen(true)

    // Normalize URL - extract pathname if it's a full URL
    let pathname = url
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url)
        pathname = urlObj.pathname
      } catch (e) {
        // Invalid URL, use as-is
        pathname = url
      }
    }

    // Store the original URL for display
    const normalizedUrl = url.startsWith('/')
      ? typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url
      : url
    setFrameUrl(normalizedUrl)

    // Update query parameters for tracking (without navigation)
    if (updateUrl && typeof window !== 'undefined') {
      const currentQuery = { ...router.query }
      currentQuery.emaFrame = pathname

      router.replace(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      )
    }

    try {
      // Fetch content from API - API expects the full URL or pathname
      const response = await fetch('/api/ema/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Frame content fetched:', result)
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

    // Remove frame query parameter
    if (updateUrl && typeof window !== 'undefined') {
      const currentQuery = { ...router.query }
      delete currentQuery.emaFrame

      router.replace(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
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
      // Frame URL is in query params, open frame with that content
      handleOpenFrame(emaFrame, false) // false = don't update URL (we're reading from it)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Update URL when chat opens/closes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const currentQuery = { ...router.query }

    if (emaChatOpen && currentQuery.emaChat !== 'true') {
      currentQuery.emaChat = 'true'
      router.replace(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      )
    } else if (!emaChatOpen && currentQuery.emaChat === 'true') {
      delete currentQuery.emaChat
      // Also remove frame if chat is closing
      delete currentQuery.emaFrame
      router.replace(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emaChatOpen])

  // Initialize user session on mount or when chat opens
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await fetch('/api/ema/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'createUser',
          }),
        })

        if (response.ok) {
          const userData = await response.json()
          // Try different possible field names from Ema API
          const userId = userData.userId || userData._id || userData.id
          if (userId) {
            setEmaUserId(userId)
          } else {
            console.error('No userId found in response:', userData)
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error)
      }
    }

    if (emaChatOpen && !emaUserId) {
      initializeUser()
    }
  }, [emaChatOpen, emaUserId, setEmaUserId])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize chat input
  useEffect(() => {
    if (!emaChatOpen || !chatInputRef.current) return

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

    return () => {
      textarea.removeEventListener('input', adjustHeight)
    }
  }, [emaChatOpen, chatInputRef])

  // Auto-focus input when chat opens
  useEffect(() => {
    if (emaChatOpen && chatInputRef.current) {
      // Small delay to ensure the DOM is ready and animations have started
      const focusTimer = setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus()
        }
      }, 300) // Delay to allow animation to start

      return () => clearTimeout(focusTimer)
    }
  }, [emaChatOpen])

  // Check if title overflows and needs animation
  useEffect(() => {
    if (emaChatOpen && titleRef.current && titleContainerRef.current) {
      const checkOverflow = () => {
        if (titleRef.current && titleContainerRef.current) {
          const titleWidth = titleRef.current.scrollWidth
          const containerWidth = titleContainerRef.current.offsetWidth
          const needsAnimation = titleWidth > containerWidth
          setShouldAnimateTitle(needsAnimation)

          if (needsAnimation && titleRef.current) {
            titleRef.current.style.setProperty(
              '--marquee-container-width',
              `${containerWidth}px`
            )
          }
        }
      }

      setTimeout(checkOverflow, 100)
      window.addEventListener('resize', checkOverflow)
      return () => window.removeEventListener('resize', checkOverflow)
    }
  }, [emaChatOpen, emaInitialSearchQuery])

  // Listen for chat open event from fixed input - MUST be before the early return
  useEffect(() => {
    const handleOpenChat = async (e) => {
      console.log('ema-open-chat event received:', e.detail)
      const { question, searchQuery, searchResults } = e.detail
      if (!question) {
        console.log('No question provided')
        return
      }

      console.log('Setting search query and results, opening chat...')
      setEmaInitialSearchQuery(searchQuery)
      setEmaSearchResults(searchResults || [])
      console.log('Before toggleEmaChat, emaChatOpen:', emaChatOpen)
      toggleEmaChat(true)

      // Update query parameters for tracking
      if (typeof window !== 'undefined') {
        const currentQuery = { ...router.query }
        currentQuery.emaChat = 'true'
        if (searchQuery) {
          currentQuery.emaSearch = encodeURIComponent(searchQuery)
        }

        router.replace(
          {
            pathname: router.pathname,
            query: currentQuery,
          },
          undefined,
          { shallow: true, scroll: false }
        )
      }
      console.log('After toggleEmaChat(true), checking state...')
      // Check state after a brief delay
      setTimeout(() => {
        console.log('State after toggle:', emaChatOpen)
      }, 100)

      // Initialize user if needed, then send message
      const sendMessageAfterInit = async () => {
        let currentUserId = emaUserId

        // If no userId, initialize it
        if (!currentUserId) {
          try {
            const response = await fetch('/api/ema/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'createUser',
              }),
            })

            if (response.ok) {
              const userData = await response.json()
              // Try different possible field names
              currentUserId = userData.userId || userData._id || userData.id
              if (currentUserId) {
                setEmaUserId(currentUserId)
              } else {
                console.error('No userId found in response:', userData)
                return
              }
            } else {
              console.error('Failed to create user:', response.status)
              return
            }
          } catch (error) {
            console.error('Error initializing user:', error)
            return
          }
        }

        // Wait a bit for state to update, then send message
        setTimeout(async () => {
          const finalUserId = currentUserId || emaUserId
          if (finalUserId && question) {
            // Send message directly with the userId
            const userMessage = {
              id: Date.now(),
              sender: 'user',
              message: question.trim(),
              timestamp: new Date().toISOString(),
            }
            setEmaChatMessages((prev) => {
              const prevArray = Array.isArray(prev) ? prev : []
              return [...prevArray, userMessage]
            })

            try {
              const emaResponse = await fetch('/api/ema/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'sendMessage',
                  userId: finalUserId,
                  message: question.trim(),
                }),
              })

              if (emaResponse.ok && emaResponse.body) {
                setIsStreaming(true)
                const reader = emaResponse.body.getReader()
                const decoder = new TextDecoder()
                let assistantMessage = {
                  id: Date.now() + 1,
                  sender: 'assistant',
                  message: '',
                  timestamp: new Date().toISOString(),
                }

                setEmaChatMessages((prev) => {
                  const prevArray = Array.isArray(prev) ? prev : []
                  return [...prevArray, assistantMessage]
                })

                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break

                  const chunk = decoder.decode(value)
                  const lines = chunk.split('\n')

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
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
                          const textContent = parsed.content
                            .map((item) => item.text?.value || '')
                            .join('')

                          if (textContent) {
                            setEmaChatMessages((prev) => {
                              const prevArray = Array.isArray(prev) ? prev : []
                              const updated = [...prevArray]
                              const lastMessage = updated[updated.length - 1]
                              if (
                                lastMessage &&
                                lastMessage.sender === 'assistant'
                              ) {
                                lastMessage.message += textContent
                              }
                              return updated
                            })
                          }
                        }

                        if (parsed.messageId) {
                          setIsStreaming(false)
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error sending message:', error)
              setIsStreaming(false)
            }
          }
        }, 300)
      }

      sendMessageAfterInit()
    }

    window.addEventListener('ema-open-chat', handleOpenChat)
    return () => {
      window.removeEventListener('ema-open-chat', handleOpenChat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async (message) => {
    if (!message?.trim() || !emaUserId) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }
    setEmaChatMessages((prev) => {
      const prevArray = Array.isArray(prev) ? prev : []
      return [...prevArray, userMessage]
    })

    try {
      const emaResponse = await fetch('/api/ema/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          userId: emaUserId,
          message: message.trim(),
        }),
      })

      if (emaResponse.ok && emaResponse.body) {
        setIsStreaming(true)
        const reader = emaResponse.body.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = {
          id: Date.now() + 1,
          sender: 'assistant',
          message: '',
          timestamp: new Date().toISOString(),
        }

        setEmaChatMessages((prev) => {
          const prevArray = Array.isArray(prev) ? prev : []
          return [...prevArray, assistantMessage]
        })

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
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
                  const textContent = parsed.content
                    .map((item) => item.text?.value || '')
                    .join('')

                  if (textContent) {
                    setEmaChatMessages((prev) => {
                      const prevArray = Array.isArray(prev) ? prev : []
                      const updated = [...prevArray]
                      const lastMessage = updated[updated.length - 1]
                      if (lastMessage && lastMessage.sender === 'assistant') {
                        lastMessage.message += textContent
                      }
                      return updated
                    })
                  }
                }

                if (parsed.messageId) {
                  setIsStreaming(false)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsStreaming(false)
    }
  }

  // Dispatch chat state changes
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('ema-chat-state-change', {
        detail: { isOpen: emaChatOpen },
      })
    )
  }, [emaChatOpen])

  const gradientStyle = {
    background:
      'linear-gradient(to bottom, #019AD7 0%, #ADF4FF 45%, #FEFFD8 74%, #FFFFFF 100%)',
  }

  // Always render the portal so event listeners are active
  // But only show content when chat is open
  return (
    <InPortal id="ema-chat">
      <AnimatePresence>
        {emaChatOpen && (
          <FocusTrap
            active={emaChatOpen && hasFocus}
            focusTrapOptions={{
              allowOutsideClick: true,
              preventScroll: true,
            }}
          >
            <m.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={(v) => setHasFocus(v === 'show')}
              className="fixed inset-0 z-[1000] flex"
              style={gradientStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ema-chat-title"
              onClick={(e) => {
                if (frameOpen && e.target === e.currentTarget) {
                  handleCloseFrame()
                }
              }}
            >
              {/* Chat Container */}
              <m.div
                initial={{ scale: 0.95, opacity: 0, width: '100%' }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  width: frameOpen && !isMobile ? '50%' : '100%',
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={frameTransition}
                className="relative h-full flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="absolute top-0 left-0 w-full flex items-center justify-between p-15 md:p-30 pl-15 md:pl-0 pr-15 flex-shrink-0">
                  <div className="flex items-center gap-10 flex-1 min-w-0 bg-pink md:bg-transparent rounded-full py-20 md:py-0 px-10 md:px-0">
                    <div
                      ref={titleContainerRef}
                      className="flex-1 min-w-0 overflow-hidden max-w-full md:max-w-[]max-w-[calc(50vw-35rem)] relative px-10 md:px-25"
                      style={{
                        maskImage:
                          'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)',
                      }}
                    >
                      <h2
                        ref={titleRef}
                        id="ema-chat-title"
                        className={`font-plaid text-white font-normal uppercase text-14 whitespace-nowrap ${
                          shouldAnimateTitle ? 'animate-marquee' : ''
                        }`}
                      >
                        {emaInitialSearchQuery &&
                          `new chat for: ${emaInitialSearchQuery.toUpperCase()}`}
                      </h2>
                    </div>
                  </div>
                  {!frameOpen && (
                    <m.button
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: frameOpen ? 'opacity-0' : 'opacity-100',
                      }}
                      exit={{ opacity: 0 }}
                      onClick={() => toggleEmaChat(false)}
                      className="absolute top-18 md:top-25 right-15 md:right-25 z-10 w-[4.5rem] md:w-[6rem] h-[4.5rem] md:h-[6rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-pink transition-colors focus:outline-none"
                      aria-label="Close chat"
                    >
                      <Icon
                        name="Close"
                        viewBox="0 0 22 22"
                        className="w-[1.6rem] md:w-[2.2rem] h-[1.6rem] md:h-[2.2rem]"
                      />
                    </m.button>
                  )}
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto no-bar space-y-20 pt-80 md:pt-25 px-15 md:px-0"
                >
                  {messages.length === 0 && (
                    <div className="max-w-[50rem] mx-auto">
                      Start a conversation with Julie AI...
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex max-w-[50rem] mx-auto ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={cx(
                          'max-w-[100%]md:max-w-[80%] p-15 md:p-20 rounded-[1rem] rc',
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
                  ))}
                </div>

                {/* Chat Input - Bottom */}
                <div className="flex-shrink-0 w-full max-w-[50rem] mx-auto pb-25 px-15 md:px-0">
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
                    className="flex gap-10 relative items-end"
                  >
                    <m.div
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: chatInputText.trim().length > 0 ? 0 : 1,
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
                      ref={chatInputRef}
                      placeholder="How can Julie help?"
                      rows={1}
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      className={cx(
                        'transition-all duration-300 flex-1 border border-pink rounded-[3rem] pr-[4.5rem] py-15 text-14 md:text-16 outline-none resize-none overflow-y-auto min-h-[4.5rem] max-h-[30rem] font-lm ema-gradient-placeholder',
                        {
                          'pl-35': chatInputText.trim().length === 0,
                          'pl-15': chatInputText.trim().length > 0,
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

                {/* Search Results */}
                {emaSearchResults && emaSearchResults.length > 0 && (
                  <m.div
                    animate={{
                      opacity: frameOpen ? 0 : 1,
                    }}
                    transition={frameTransition}
                    className="block md:block absolute bottom-0 right-0 w-full md:w-[25rem] h-screen pb-25 pt-[10rem] overflow-y-auto flex-shrink-0 pointer-events-none"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                      pointerEvents: frameOpen ? 'none' : 'auto',
                    }}
                  >
                    <div className="w-full max-w-[50rem] mx-auto px-15 md:px-25">
                      {/* <div className="text-14 md:text-16 font-medium text-white mb-15">
                        Suggested Articles
                      </div> */}
                      <div className="space-y-10">
                        {emaSearchResults.map((article, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleOpenFrame(`/blog/${article.slug}`)
                            }
                            className="block group w-full text-left"
                          >
                            <div className="overflow-hidden relative w-full h-[28rem] rounded-[1.5rem]">
                              {/* Article Image */}
                              {article.image ? (
                                <div className="w-full h-full relative">
                                  <Image
                                    src={article.image.url || article.image}
                                    alt={article.image.alt || article.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    placeholder={
                                      article.image.lqip ? 'blur' : undefined
                                    }
                                    blurDataURL={article.image.lqip}
                                  />
                                </div>
                              ) : article.gradient ? (
                                <div className="w-full h-full relative">
                                  <Gradient gradient={article.gradient} />
                                </div>
                              ) : null}
                              {/* Article Content */}
                              <div
                                className={cx(
                                  `p-15 absolute bottom-0 left-0 w-full text-white`,
                                  {
                                    'bg-gradient-to-t from-black to-transparent':
                                      !article.gradient,
                                  }
                                )}
                              >
                                {article.authors &&
                                  article.authors.length > 0 && (
                                    <div className="text-12 text-gray-300 mb-5">
                                      by{' '}
                                      {article.authors[0]?.title ||
                                        article.authors[0]?.name}
                                    </div>
                                  )}
                                <h4 className="text-16 font-lb text-white line-clamp-2">
                                  {article.title}
                                </h4>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </m.div>
                )}
              </m.div>

              {/* Page Frame Popup */}
              <AnimatePresence>
                {frameOpen && frameUrl && (
                  <m.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={frameTransition}
                    className={cx(
                      'absolute right-0 top-0 h-full z-[1002] flex flex-col flex-shrink-0',
                      {
                        'w-full': isMobile, // Full width overlay on mobile
                        'w-1/2 p-25': !isMobile, // Split screen on desktop
                      }
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Frame Header - commented out in original */}
                    <div className="absolute z-[9999] top-0 left-0 w-full px-15 md:px-0 pt-15 md:pt-0">
                      <div className="flex items-center justify-between p-20 rounded-full text-white bg-pink flex-shrink-0">
                        <button
                          onClick={handleCloseFrame}
                          className="rounded-full flex md:hidden items-center justify-center flex-shrink-0 rotate-180"
                          aria-label="Close frame"
                        >
                          <Icon
                            name={'Arrow'}
                            viewBox={'0 0 14 14'}
                            className={cx({
                              'w-[1.6rem] flex items-center justify-center':
                                isMobile,
                            })}
                          />
                        </button>
                        <h3 className="text-14 font-plaid uppercase font-normal truncate flex-1 px-10 text-center">
                          {frameContent?.data?.page?.title ||
                            frameUrl.replace(/^https?:\/\/[^/]+/, '')}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseFrame}
                      className={cx(
                        'absolute bg-pink rounded-full text-white hidden md:flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none flex-shrink-0',
                        {
                          'top-15 right-15 w-[4.5rem] h-[4.5rem]': isMobile, // Top right on mobile
                          'left-0 -translate-x-full w-[6rem] h-[6rem]':
                            !isMobile, // Left side on desktop
                        }
                      )}
                      aria-label="Close frame"
                    >
                      <Icon
                        name={isMobile ? 'Close' : 'Arrow'}
                        viewBox={isMobile ? '0 0 22 22' : '0 0 14 14'}
                        className={cx({
                          'w-[1.6rem] h-[1.6rem] rotate-180': !isMobile,
                          'w-[1.6rem] h-[1.6rem]': isMobile,
                        })}
                      />
                    </button>

                    {/* Frame Content */}
                    <div className="relative w-full flex-1 overflow-y-auto no-bar bg-white md:border border-pink md:rounded-[1.5rem] pt-90 md:pt-0 py-20 md:py-0">
                      {frameLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-16 text-gray-500">
                            Loading...
                          </div>
                        </div>
                      ) : frameContent &&
                        frameContent.data &&
                        frameContent.data.page ? (
                        <div className="ema-frame-mobile">
                          <PageContent
                            page={frameContent.data.page}
                            type={frameContent.type}
                            sanityConfig={{
                              projectId:
                                process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
                              dataset:
                                process.env.NEXT_PUBLIC_SANITY_PROJECT_DATASET,
                            }}
                            isInFrame={true}
                            onFrameLinkClick={handleOpenFrame}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-16 text-gray-500">
                            Content not found
                          </div>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </InPortal>
  )
}

export default EmaChat
