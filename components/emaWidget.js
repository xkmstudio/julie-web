import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { m, AnimatePresence } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import Image from 'next/image'
import Icon from '@components/icon'
import NextLink from 'next/link'
import { InPortal } from '@lib/helpers'
import PageContent from '@components/page-content'

const frameTransition = {
  duration: .6,
  ease: [0.16, 1, 0.3, 1],
}

// Helper function to check if a URL is internal (juliecare.co)
const isInternalLink = (url) => {
  if (!url) return false
  
  // Relative URLs are internal
  if (url.startsWith('/')) return true
  
  // Check if URL is from juliecare.co
  try {
    if (typeof window !== 'undefined') {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.hostname === 'juliecare.co' || urlObj.hostname === window.location.hostname
    }
    // Server-side check
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

  // Find all markdown links [text](url)
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

  // Find all plain URLs (not inside markdown links)
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

  // Combine and sort all links/URLs
  const allLinks = [...links, ...plainUrls].sort((a, b) => a.start - b.start)

  // Process text with all links
  allLinks.forEach((link) => {
    // Add text before link
    if (link.start > currentIndex) {
      const beforeText = text.substring(currentIndex, link.start)
      // Process bold in before text
      const boldProcessed = processBold(beforeText, elementKey)
      if (Array.isArray(boldProcessed)) {
        elements.push(...boldProcessed)
        elementKey += boldProcessed.length
      } else {
        elements.push(boldProcessed)
        elementKey++
      }
    }

    // Determine if link is internal
    const url = link.type === 'markdown' ? link.url : link.url
    const isInternal = isInternalLink(url)

    // Add link or button
    if (link.type === 'markdown') {
      const linkTextBold = processBold(link.linkText, elementKey)
      
      if (isInternal && onOpenFrame) {
        // Internal link - render as button that opens frame
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
        // External link - render as normal link
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
      // Plain URL
      if (isInternal && onOpenFrame) {
        // Internal URL - render as button
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
        // External URL - render as normal link
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

  // Add remaining text
  if (currentIndex < text.length) {
    const remaining = text.substring(currentIndex)
    const boldProcessed = processBold(remaining, elementKey)
    if (Array.isArray(boldProcessed)) {
      elements.push(...boldProcessed)
    } else {
      elements.push(boldProcessed)
    }
  }

  // If no links found, just process bold
  if (allLinks.length === 0) {
    const boldProcessed = processBold(text, 0)
    return Array.isArray(boldProcessed) ? boldProcessed : [boldProcessed]
  }

  return elements.length > 0 ? elements : [text]
}

// Helper to process bold text **text**
const processBold = (text, startKey = 0) => {
  if (!text || typeof text !== 'string') return text

  const parts = []
  const boldRegex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match
  let key = startKey

  while ((match = boldRegex.exec(text)) !== null) {
    // Text before bold
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      if (beforeText) {
        parts.push(beforeText)
      }
    }
    // Bold text
    parts.push(
      <strong key={`bold-${key++}`} className="font-bold">
        {match[1]}
      </strong>
    )
    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    if (remaining) {
      parts.push(remaining)
    }
  }

  // Always return an array for consistency
  return parts.length > 0 ? parts : [text]
}

const EmaWidget = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userId, setUserId] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [initialSearchQuery, setInitialSearchQuery] = useState('')
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false)
  const [frameOpen, setFrameOpen] = useState(false)
  const [frameUrl, setFrameUrl] = useState(null)
  const [frameContent, setFrameContent] = useState(null)
  const [frameLoading, setFrameLoading] = useState(false)
  const chatContainerRef = useRef(null)
  const overlayRef = useRef(null)
  const inputRef = useRef(null)
  const titleRef = useRef(null)
  const titleContainerRef = useRef(null)

  // Handler to open frame with URL
  const handleOpenFrame = async (url) => {
    setFrameLoading(true)
    setFrameOpen(true)
    
    // Normalize URL - if relative, make it absolute for display
    let normalizedUrl = url
    if (url.startsWith('/')) {
      normalizedUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${url}`
        : url
    }
    setFrameUrl(normalizedUrl)

    try {
      // Fetch content from API
      const response = await fetch('/api/ema/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        const result = await response.json()
        setFrameContent(result)
      } else {
        console.error('Failed to fetch content')
        setFrameContent(null)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      setFrameContent(null)
    } finally {
      setFrameLoading(false)
    }
  }

  // Close frame handler
  const handleCloseFrame = () => {
    setFrameOpen(false)
    setFrameUrl(null)
    setFrameContent(null)
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Initialize user session on mount
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
          const data = await response.json()
          setUserId(data._id)
        }
      } catch (error) {
        console.error('Error initializing user:', error)
      }
    }

    initializeUser()
  }, [])

  // Handle body scroll lock and escape key
  useEffect(() => {
    if (chatOpen) {
      document.documentElement.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (frameOpen) {
            handleCloseFrame()
          } else {
            setChatOpen(false)
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.documentElement.style.overflow = null
      }
    } else {
      document.documentElement.style.overflow = null
    }
  }, [chatOpen, frameOpen])

  // Focus input when overlay opens
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [chatOpen])

  // Check if title overflows and needs animation
  useEffect(() => {
    if (chatOpen && titleRef.current && titleContainerRef.current) {
      const checkOverflow = () => {
        if (titleRef.current && titleContainerRef.current) {
          const titleWidth = titleRef.current.scrollWidth
          const containerWidth = titleContainerRef.current.offsetWidth
          const needsAnimation = titleWidth > containerWidth
          setShouldAnimateTitle(needsAnimation)

          // Set CSS variable for animation calculation
          if (needsAnimation && titleRef.current) {
            titleRef.current.style.setProperty(
              '--marquee-container-width',
              `${containerWidth}px`
            )
          }
        }
      }

      // Check after a short delay to ensure DOM is ready
      setTimeout(checkOverflow, 100)
      window.addEventListener('resize', checkOverflow)
      return () => window.removeEventListener('resize', checkOverflow)
    }
  }, [chatOpen, initialSearchQuery])

  const sendMessage = async (message) => {
    if (!message?.trim() || !userId) return

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    // Send to Ema API with streaming
    try {
      const emaResponse = await fetch('/api/ema/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          userId: userId,
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

        setChatMessages((prev) => [...prev, assistantMessage])

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
                    setChatMessages((prev) => {
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

  const onSubmit = async (data) => {
    const question = data.question?.trim()
    if (!question) return

    setIsSubmitting(true)

    try {
      // 1. Search Algolia for relevant articles
      const searchResponse = await fetch('/api/ema/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        setSearchResults(searchData.hits || [])
      }

      // 2. Store the initial search query and open chat overlay
      const truncatedQuery =
        question.length > 50 ? question.substring(0, 50) + '...' : question
      setInitialSearchQuery(truncatedQuery)
      setChatOpen(true)
      await sendMessage(question)
    } catch (error) {
      console.error('Error submitting question:', error)
    } finally {
      setIsSubmitting(false)
      reset()
    }
  }

  // Gradient background style
  const gradientStyle = {
    background:
      'linear-gradient(to bottom, #019AD7 0%, #ADF4FF 45%, #FEFFD8 74%, #FFFFFF 100%)',
  }

  return (
    <>
      {/* Initial Form */}
      <div className="ema-widget w-full max-w-[600px] mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-[1rem] p-20 md:p-30 border border-pink shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative"
        >
          <div className="flex items-center gap-10 mb-15">
            <Icon
              name="star"
              viewBox="0 0 19 19"
              className="w-[1.5rem] h-[1.5rem] text-pink flex-shrink-0"
            />
            <h3 className="text-16 md:text-18 font-medium text-pink">
              How can Julie Help?
            </h3>
          </div>

          <div className="relative mb-10">
            <input
              type="text"
              placeholder="Ask a question..."
              className="w-full bg-transparent border-none outline-none text-14 md:text-16 text-black placeholder:text-gray-400 pr-[3.5rem]"
              {...register('question', {
                required: 'Please enter a question',
              })}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[2.5rem] h-[2.5rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-[#DA1961] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit question"
            >
              <Icon
                name="Arrow Up"
                viewBox="0 0 14 14"
                className="w-[1.2rem] h-[1.2rem]"
              />
            </button>
          </div>

          <p className="text-12 text-gray-500 italic mt-10">
            Julie AI is vetted by medical professionals and completely
            anonymous.
          </p>

          {errors.question && (
            <p className="text-12 text-red-500 mt-5">
              {errors.question.message}
            </p>
          )}
        </form>
      </div>

      {/* Chat Overlay */}
      <InPortal id="ema-chat">
        <AnimatePresence>
          {chatOpen && (
            <FocusTrap
              active={hasFocus}
              focusTrapOptions={{
                fallbackFocus: () => overlayRef.current,
                allowOutsideClick: false,
              }}
            >
              <m.div
                ref={overlayRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onAnimationComplete={(v) => setHasFocus(v === 'show')}
                onClick={(e) => {
                  // Close frame if clicking outside of chat container and frame
                  // Both chat container and frame have stopPropagation, so if the click
                  // reaches here and frame is open, it means we clicked on the overlay background
                  if (frameOpen && e.target === e.currentTarget) {
                    handleCloseFrame()
                  }
                }}
                className="fixed inset-0 z-[1000] flex"
                style={gradientStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ema-chat-title"
              >
                <button
                  onClick={() => setChatOpen(false)}
                  className="absolute top-25 right-25 z-10 w-[6rem] h-[6rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-[#DA1961] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink"
                  aria-label="Close chat"
                >
                  <Icon
                    name="Close"
                    viewBox="0 0 24 24"
                    className="w-[1.6rem] h-[1.6rem]"
                  />
                </button>

                {/* Header */}
                <div className="absolute top-0 left-0 w-full flex items-center justify-between p-20 md:p-30 pl-0 md:pl-0 flex-shrink-0">
                  <div className="flex items-center gap-10 flex-1 min-w-0">
                    <div
                      ref={titleContainerRef}
                      className="flex-1 min-w-0 overflow-hidden max-w-[calc(50vw-35rem)] relative px-25"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)',
                      }}
                    >
                      <h2
                        ref={titleRef}
                        id="ema-chat-title"
                        className={`font-plaid font-normal uppercase text-14 whitespace-nowrap ${
                          shouldAnimateTitle ? 'animate-marquee' : ''
                        }`}
                      >
                        {initialSearchQuery
                          ? `new chat for: ${initialSearchQuery.toUpperCase()}`
                          : 'Stick Chat Searched'}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Chat Container */}
                <m.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    width: frameOpen ? '50%' : '100%',
                  }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={frameTransition}
                  className="relative h-full flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Content Area */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Chat Messages - Left Side */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Messages Container */}
                      <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto no-bar space-y-20 pt-25"
                      >
                        {chatMessages.length === 0 && (
                          <div className="max-w-[50rem] mx-auto">
                            Start a conversation with Julie AI...
                          </div>
                        )}
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex max-w-[50rem] mx-auto ${
                              msg.sender === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-15 md:p-20 rounded-[1rem] rc ${
                                msg.sender === 'user'
                                  ? 'bg-white text-black'
                                  : 'bg-transparent'
                              }`}
                            >
                              <div className="text-14 md:text-16 whitespace-pre-wrap leading-relaxed">
                                {processMessageLinks(msg.message || '', handleOpenFrame)}
                              </div>
                              {isStreaming &&
                                msg.sender === 'assistant' &&
                                msg.id ===
                                  chatMessages[chatMessages.length - 1]?.id && (
                                  <span className="inline-block w-[0.5rem] h-[1rem] bg-current ml-5 animate-pulse" />
                                )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input - Bottom */}
                      <div className="flex-shrink-0 w-full max-w-[50rem] mx-auto pb-25">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault()
                            const input = e.target.querySelector('input')
                            const question = input?.value?.trim()
                            if (!question) return

                            input.value = ''
                            await sendMessage(question)
                          }}
                          className="flex gap-10 relative"
                        >
                          <Icon
                            name="star"
                            viewBox="0 0 19 19"
                            className="absolute left-15 top-1/2 -translate-y-1/2 w-[1.5rem] h-[1.5rem] text-pink flex-shrink-0"
                          />
                          <input
                            ref={inputRef}
                            type="text"
                            placeholder="How can Julie help?"
                            className="flex-1 border border-pink rounded-full pl-35 pr-10 py-15 text-14 md:text-16 outline-none focus:border-pink focus:ring-2 focus:ring-pink/20"
                            aria-label="Chat message input"
                          />
                          <button
                            type="submit"
                            disabled={isStreaming}
                            className="absolute right-10 top-1/2 -translate-y-1/2 w-[3rem] h-[3rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-[#DA1961] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink"
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

                    {/* Algolia Results - Right Sidebar */}
                    {searchResults && searchResults.length > 0 && (
                      <m.div
                        animate={{ 
                          opacity: frameOpen ? 0 : 1,
                        }}
                        transition={frameTransition}
                        className="absolute bottom-0 right-0 w-full md:w-[25rem] h-screen pb-25 pt-[10rem] overflow-y-auto flex-shrink-0 pointer-events-none"
                        style={{
                          maskImage: 'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 100px, black 100%)',
                          pointerEvents: frameOpen ? 'none' : 'auto',
                        }}
                      >
                        <div className="px-25">
                          <div className="space-y-10">
                            {searchResults.map((article, index) => (
                              <button
                                key={index}
                                onClick={() => handleOpenFrame(`/blog/${article.slug}`)}
                                className="block group w-full text-left"
                              >
                                <div className="overflow-hidden relative w-full h-[28rem] rounded-[1.5rem]">
                                  {/* Article Image */}
                                  {article.image && (
                                    <div className="w-full h-full relative">
                                      <Image
                                        src={article.image.url}
                                        alt={article.image.alt || article.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        placeholder={
                                          article.image.lqip
                                            ? 'blur'
                                            : undefined
                                        }
                                        blurDataURL={article.image.lqip}
                                      />
                                    </div>
                                  )}
                                  {/* Article Content */}
                                  <div className="p-15 absolute bottom-0 left-0 w-full text-white bg-gradient-to-t from-black to-transparent">
                                    {article.authors &&
                                      article.authors.length > 0 && (
                                        <div className="text-12 text-gray-600 mb-5">
                                          by{' '}
                                          {article.authors[0]?.title ||
                                            article.authors[0]?.name}
                                        </div>
                                      )}
                                    <h4 className="text-16 font-lb text-gray-900 line-clamp-2">
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
                  </div>
                </m.div>

                {/* Page Frame Popup */}
                <AnimatePresence>
                  {frameOpen && frameUrl && (
                    <m.div
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={frameTransition}
                      className="absolute right-0 top-0 w-1/2 h-full z-[1002] flex flex-col flex-shrink-0 p-25"
                      onClick={(e) => e.stopPropagation()}
                    >
                        {/* Frame Header */}
                        {/* <div className="flex items-center justify-between p-20 border-b border-gray-200 bg-white flex-shrink-0">
                          <button
                            onClick={handleCloseFrame}
                            className="w-[3rem] h-[3rem] rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink flex-shrink-0"
                            aria-label="Close frame"
                          >
                            <Icon
                              name="Close"
                              viewBox="0 0 24 24"
                              className="w-[1.2rem] h-[1.2rem]"
                            />
                          </button>
                          <h3 className="text-16 font-medium text-black truncate flex-1 px-20 text-center">
                            {frameContent?.data?.page?.title || frameUrl.replace(/^https?:\/\/[^/]+/, '')}
                          </h3>
                          <div className="w-[3rem] flex-shrink-0" /> 
                        </div> */}

                        <button
                            onClick={handleCloseFrame}
                            className="absolute left-0 -translate-x-full w-[6rem] h-[6rem] bg-pink rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink flex-shrink-0"
                            aria-label="Close frame"
                          >
                            <Icon
                              name="Close"
                              viewBox="0 0 24 24"
                              className="w-[1.2rem] h-[1.2rem]"
                            />
                          </button>

                        {/* Frame Content */}
                        <div className="relative w-full flex-1 overflow-y-auto no-bar bg-white rounded-[1.5rem]">
                          {frameLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-16 text-gray-500">Loading...</div>
                            </div>
                          ) : frameContent?.data?.page ? (
                            <div className="p-20 md:p-30 ema-frame-mobile">
                              <PageContent
                                page={frameContent.data.page}
                                type={frameContent.type}
                                sanityConfig={{
                                  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
                                  dataset: process.env.NEXT_PUBLIC_SANITY_PROJECT_DATASET,
                                }}
                                isInFrame={true}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-16 text-gray-500">Content not found</div>
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
    </>
  )
}

export default EmaWidget
