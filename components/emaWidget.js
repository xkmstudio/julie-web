import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { m } from 'framer-motion'
import Icon from '@components/icon'
import cx from 'classnames'

const EmaWidget = () => {
  const router = useRouter()
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

  return (
    <>
      {/* Initial Form */}
      <div className="ema-widget w-full max-w-[600px] mx-auto julie-gradient rounded-[1.5rem] relative">
        <div className="rounded-[1.5rem] absolute top-0 left-0 w-full h-full blur-[5px] md:blur-[10px] julie-gradient has-blur"></div>
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
              value={isSubmitting ? "Thinking..." : initialInputText}
              disabled={isSubmitting}
              onChange={(e) => {
                if (isSubmitting) return
                const value = e.target.value
                setInitialInputText(value)
                setValue('question', value, { shouldValidate: true })
              }}
              placeholder={isSubmitting ? "Thinking..." : "How can Julie help?"}
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
        </form>
      </div>
    </>
  )
}

export default EmaWidget
