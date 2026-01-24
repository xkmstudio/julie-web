import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { m } from 'framer-motion'
import Icon from '@components/icon'
import cx from 'classnames'

const EmaWidget = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialInputText, setInitialInputText] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    const question = data.question?.trim()
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
      const event = new CustomEvent('ema-open-chat', {
        detail: {
          question,
          searchQuery: truncatedQuery,
          searchResults, // Always include searchResults, even if empty
        },
      })
      window.dispatchEvent(event)
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
    } finally {
      setIsSubmitting(false)
      setInitialInputText('')
      reset()
    }
  }

  return (
    <>
      {/* Initial Form */}
      <div className="ema-widget w-full max-w-[600px] mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-pink rounded-[1.5rem] overflow-hidden relative h-[15rem] flex flex-col"
        >
          {/* Header */}
          {/* <div className="flex items-center gap-10 p-20 pb-10 flex-shrink-0">
            <m.div
              initial={{ opacity: 1 }}
              animate={{ opacity: initialInputText.trim().length > 0 ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <Icon
                name="star"
                viewBox="0 0 19 19"
                className="w-[1.5rem] h-[1.5rem] text-pink"
              />
            </m.div>
            <h3 className="text-16 md:text-18 font-medium text-pink">
              How can Julie Help?
            </h3>
          </div> */}

          {/* Input Area */}
          <div className="flex-1 relative flex items-start h-full">
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
            <m.div
              initial={{ opacity: 1 }}
              animate={{ opacity: initialInputText.trim().length > 0 ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="text-slate text-12 absolute left-20 bottom-20 italic text-left pr-90"
            >
              Julie AI is vetted by medical professionals and completely anonymous.
            </m.div>
            <textarea
              {...register('question', {
                required: 'Please enter a question',
              })}
              value={initialInputText}
              onChange={(e) => {
                const value = e.target.value
                setInitialInputText(value)
                setValue('question', value, { shouldValidate: true })
              }}
              placeholder="How can Julie help?"
              rows={1}
              className={cx(
                'transition-all duration-300 py-[1.6rem] w-full border-none outline-none text-14 md:text-16 text-black resize-none overflow-y-auto font-lm ema-gradient-placeholder',
                {
                  'pl-40': initialInputText.trim().length === 0,
                  'pl-15': initialInputText.trim().length > 0,
                }
              )}
              style={{ height: '100%', minHeight: 'auto' }}
              onInput={(e) => {
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
        </form>
      </div>
    </>
  )
}

export default EmaWidget
