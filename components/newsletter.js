import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import cx from 'classnames'
import axios from 'axios'

import { fadeAnim } from '@lib/animate'
import Icon from '@components/icon'

const Newsletter = ({ newsletter, layout, type = 'general' }) => {
  // Extract our module data
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm()

  // Call to reset the form
  const resetForm = (e) => {
    e.preventDefault()
    reset()
    setError(false)
    setSuccess(false)
    setSubmitting(false)
  }

  // handle form submission
  const onSubmit = async (data) => {
    setSubmitting(true)
    setError(false)

    try {
      const response = await fetch('/api/klaviyo/newsletter-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listID: newsletter?.klaviyoListID,
          email: data.email,
          fullname: data.fullname,
        }),
      })

      const result = await response.json()
      console.log('success res', result)
      setSuccess(true)
    } catch (err) {
      console.error('error', err)
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="w-full form newsletter" onSubmit={handleSubmit(onSubmit)}>
      {!error && !success && (
        <div className="form--fields">
          <div className="control--group">
            <div
              className={`w-full flex gap-[1.5rem]${
                layout == 'vertical' ? ' flex-col' : ' items-start flex-col'
              }`}
            >
              {newsletter?.title && (
                <div className={``}>{newsletter.title}</div>
              )}
              <div className="w-full bg-gradient-to-b from-[#CD1157] to-[#DA1961] text-white rounded-full shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.25)]">
                <div className="relative flex justify-between p-10 md:p-15">
                  <label htmlFor={`fullname`} className="form-label is-hidden">
                    fullname
                  </label>
                  <input
                    id={`fullname`}
                    name="fullname"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    className="hidden"
                    placeholder="fullname"
                    {...register('fullname')}
                  />
                  <label htmlFor={`email`} className="form-label is-hidden">
                    Email Address
                  </label>
                  <input
                    id={`email`}
                    name="email"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    className={`block px-15 py-10 text-14 flex-1 bg-transparent`}
                    placeholder="Email Address"
                    {...register('email', {
                      required: 'This field is required.',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address.',
                      },
                    })}
                  />

                  <button
                    type="submit"
                    className={cx('btn-text', {
                      'is-loading flex-shrink-0': submitting,
                    })}
                    disabled={submitting}
                  >
                    <div className="btn-gradient w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center">
                      <div className='w-[1.2rem] flex items-center justify-center'>
                        <Icon name="Arrow" viewBox="0 0 14 14" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              {errors?.email && (
                <span role="alert" className="form-error text-12 text-red">
                  A valid email is required.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="form--success p-20 border border-ash rounded-[.5rem]">
          <div
            className={cx('form--success-content', {
              'text-center': layout == 'large',
            })}
          >
            <div className="title-sm text-center">
              {newsletter.success ||
                'Thanks for signing up. Check your inbox for updates.'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          key="error"
          initial="hide"
          animate="show"
          exit="hide"
          variants={fadeAnim}
          className="form--error"
        >
          <div className="form--error-content">
            <h2>There was an error submitting.</h2>
            <p className="form--error-reset">
              <button
                className="btn is-solid mt-15"
                onClick={(e) => resetForm(e)}
              >
                try again
              </button>
            </p>
          </div>
        </div>
      )}
    </form>
  )
}

export default Newsletter
