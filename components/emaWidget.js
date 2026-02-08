import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { m, AnimatePresence } from 'framer-motion'
import Icon from '@components/icon'
import cx from 'classnames'
import { getSanityClient } from '@lib/sanity'

const EmaWidget = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialInputText, setInitialInputText] = useState('')
  const [emaSettings, setEmaSettings] = useState(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Fetch EMA settings
  useEffect(() => {
    const fetchEmaSettings = async () => {
      try {
        const settings = await getSanityClient().fetch(
          `*[_type == "emaSettings"][0]{
            suggestions,
            chatPlaceholder,
            disclaimer
          }`
        )
        setEmaSettings(settings)
      } catch (error) {
        console.error('Error fetching EMA settings:', error)
      }
    }
    fetchEmaSettings()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const handleSuggestionClick = (suggestion) => {
    setInitialInputText(suggestion)
    setValue('question', suggestion, { shouldValidate: true })
    setIsInputFocused(false)
    // Auto-submit the suggestion
    setTimeout(() => {
      handleSubmit(onSubmit)()
    }, 100)
  }

  const onSubmit = async (data) => {
    const question = data.question?.trim()
    if (!question) return

    setIsSubmitting(true)
    setIsInputFocused(false)

    let searchResults = []

    try {
      // Save current scroll position to sessionStorage for restoration on back
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      sessionStorage.setItem('emaChatReturnScroll', scrollY.toString())

      // Navigate immediately - don't wait for search to complete
      // This reduces perceived lag
      router.push({
        pathname: '/ema-chat',
        query: {
          q: question,
          from: router.asPath, // Save current route for back navigation
        },
      }, undefined, { shallow: false })

      // Search Algolia in the background (optional, can be done on chat page)
      // We'll let the chat page handle the search if needed
    } catch (error) {
      console.error('Error navigating to chat:', error)
      setIsSubmitting(false)
      setInitialInputText('')
      reset()
    }
    // Note: We don't reset state here because navigation will unmount the component
  }

  const placeholderText = emaSettings?.chatPlaceholder || 'How can Julie help?'
  const disclaimer = emaSettings?.disclaimer
  const suggestions = emaSettings?.suggestions || []
  
  // Show suggestions when input is focused or user has typed something
  const shouldShowSuggestions = 
    suggestions.length > 0 && 
    !isSubmitting && 
    (isInputFocused || initialInputText.trim().length > 0)

  return (
    <>
      {/* Initial Form */}
      <div className="ema-widget w-full max-w-[600px] mx-auto julie-gradient rounded-[1.5rem] relative">
        <div className="rounded-[1.5rem] absolute top-0 left-0 w-full h-full blur-[5px] md:blur-[10px] julie-gradient has-blur"></div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-pink rounded-[1.5rem] relative h-[15rem] flex flex-col"
        >
          {/* Input Area */}
          <div className="flex-1 relative flex items-start h-full rounded-[1.5rem] overflow-hidden">
            <m.div
              initial={{ opacity: 1 }}
              animate={{ opacity: initialInputText.trim().length > 0 ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <Icon
                name="star"
                viewBox="0 0 19 19"
                className="w-[1.5rem] h-[1.5rem] text-pink absolute left-15 top-20"
              />
            </m.div>
            {disclaimer && (
              <m.div
                initial={{ opacity: 1 }}
                animate={{ opacity: initialInputText.trim().length > 0 ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="text-slate text-10 absolute left-20 bottom-20 italic text-left max-w-[40rem]"
              >
                {disclaimer}
              </m.div>
            )}
            <textarea
              {...register('question', {
                required: 'Please enter a question',
              })}
              value={isSubmitting ? "Thinking..." : initialInputText}
              disabled={isSubmitting}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow click events
                setTimeout(() => setIsInputFocused(false), 200)
              }}
              onChange={(e) => {
                if (isSubmitting) return
                const value = e.target.value
                setInitialInputText(value)
                setValue('question', value, { shouldValidate: true })
              }}
              placeholder={isSubmitting ? "Thinking..." : placeholderText}
              rows={1}
              className={cx(
                'transition-all duration-300 py-[1.6rem] w-full border-none outline-none text-14 md:text-16 text-black resize-none overflow-y-auto font-lm ema-gradient-placeholder',
                {
                  'pl-40': (initialInputText.trim().length === 0 && !isSubmitting),
                  'pl-15': (initialInputText.trim().length > 0 || isSubmitting),
                  'opacity-70 cursor-wait ema-thinking-text': isSubmitting,
                }
              )}
              style={{ height: '100%', minHeight: 'auto' }}
              onInput={(e) => {
                if (isSubmitting) return
                const textarea = e.target
                textarea.style.height = '100%'
                const scrollHeight = textarea.scrollHeight
                const maxHeight = 150 // 15rem minus padding/header
                if (scrollHeight > maxHeight) {
                  textarea.style.height = `${150}px`
                  textarea.style.overflowY = 'auto'
                } else {
                  textarea.style.height = `${150}px`
                  textarea.style.overflowY = 'hidden'
                }
              }}
              onKeyDown={(e) => {
                if (isSubmitting) {
                  e.preventDefault()
                  return
                }
                // Allow Enter to submit, Shift+Enter for new line
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (initialInputText.trim() && !isSubmitting) {
                    e.target.form?.requestSubmit()
                  }
                }
              }}
            />
            <m.button
              type="submit"
              disabled={isSubmitting || !initialInputText.trim()}
              className="absolute right-20 bottom-20 w-[2.5rem] h-[2.5rem] rounded-full bg-pink text-white flex items-center justify-center hover:bg-pink transition-colors pointer-events-auto"
              aria-label="Submit question"
            >
              <Icon
                name="Arrow Up"
                viewBox="0 0 14 14"
                className="w-[1.2rem] h-[1.2rem]"
              />
            </m.button>
          </div>

          {/* Disclaimer - Fixed to bottom, hides when typing */}
          {/* <m.p
            initial={{ opacity: 1 }}
            animate={{ opacity: initialInputText.trim().length > 0 ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 left-20 text-12 text-left text-slate italic pointer-events-none"
          >
            Julie AI is vetted by medical professionals and completely
            anonymous.
          </m.p> */}

          {errors.question && (
            <p className="text-12 text-red-500 px-20 pb-10">
              {errors.question.message}
            </p>
          )}

          {/* Suggestions Modal - Absolutely positioned below input */}
          <AnimatePresence>
            {shouldShowSuggestions && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-[4] top-full left-0 right-0 mt-10 hidden md:block"
              >
                <div className="bg-white border border-pink rounded-[1.5rem] p-20 shadow-lg" >
                  <div className="flex flex-col gap-5">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseDown={(e) => {
                          // Prevent blur from firing before click
                          e.preventDefault()
                        }}
                        className="text-left italic ema-gradient-placeholder rounded-[1rem] hover:bg-pink/10 text-14 md:text-16 text-black border border-transparent hover:opacity-70 transition-opacity duration-300"
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </>
  )
}

export default EmaWidget
