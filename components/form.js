import React, { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { m, AnimatePresence } from 'framer-motion'
import { Widget } from '@uploadcare/react-widget'

const Form = ({ form, fields }) => {
  if (!fields?.length || !form) return null

  let fileField

  //Handle file upload
  const fileRef = useRef()
  const [fileUrl, setFileUrl] = useState('No File Uploaded')

  //Setup Form

  const FORMSPARK_ACTION_URL = `https://submit-form.com/${form.formId}`

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [radio, setRadio] = useState('yes')
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm()

  // const handleFileUpload = () => {
  //   fileField.value = fileUrl
  // }

  // useEffect(() => {
  //   fileField.value = fileUrl
  // }, [fileUrl])

  const onSubmit = (data, e) => {
    e.preventDefault()
    // console.log('data', data)

    // set an error if there's no Klaviyo list supplied...
    // if (!klaviyoListID) setError(true)

    setSubmitting(true)
    setError(false)

    fetch(FORMSPARK_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...data,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false)
        setSuccess(true)
        // console.log('res', res)
      })
      .catch((error) => {
        setSubmitting(false)
        setError(true)
        console.log(error)
      })
  }

  let controlClass

  return (
    <form
      className={`form w-full key-${form._key}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      {!error && !success && (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-x-10 gap-y-15">
            {fields.map((field, index) => {

              const formField = register(field.label)

              const handleChange = (e) => {
                const value = e.target.value
                formField.onChange(e)
                e.target.parentNode.classList.toggle('is-filled', value)
              }

              const handleBlur = (e) => {
                const value = e.target.value
                formField.onBlur(e)
                e.target.parentNode.classList.toggle('is-filled', value)
              }

              return (
                <div
                  key={field._key}
                  className={`is-clean bg-cream md:flex-grow form--${field._type}`}
                >
                  <div
                    className={`control is-custom relative bg-cream${
                      errors?.email ? ' has-error' : ''
                    }${controlClass}`}
                  >
                    <label
                      htmlFor={`contact-${field.label}--${field._key}`}
                      className={`control--label is-custom${
                        field._type == 'fieldText' ? ' for-textarea' : ''
                      }${field._type == 'fieldBoolean' ? ' hidden' : ''}`}
                      // className={`control--label ${field._type == 'fieldDate' ? 'hidden' : ''}`}
                    >
                      {field.label}
                    </label>
                    {field._type == 'fieldString' && (
                      <input
                        className={`bg-cream md:flex-grow p-10 h-full w-full`}
                        name={field.label}
                        id={`contact-${field.label}--${field._key}`}
                        autoComplete="off"
                        {...register(field.label)}
                        onFocus={(e) => {
                          e.target.parentNode.classList.add('is-filled')
                        }}
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                      />
                    )}
                    {field._type == 'fieldEmail' && (
                      <input
                        className={`bg-cream md:flex-grow p-10 h-full w-full`}
                        name={field.label}
                        type="email"
                        autoComplete="off"
                        id={`contact-${field.label}--${field._key}`}
                        {...register(field.label)}
                        onFocus={(e) => {
                          e.target.parentNode.classList.add('is-filled')
                        }}
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                      />
                    )}
                    {field._type == 'fieldText' && (
                      <textarea
                        className="bg-transparent p-10 w-full"
                        name={field.label}
                        id={`contact-${field.label}--${field._key}`}
                        {...register(field.label)}
                        onFocus={(e) => {
                          e.target.parentNode.classList.add('is-filled')
                        }}
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                      />
                    )}
                    {field._type == 'fieldFile' && (
                      <div className="form-upload--wrap">
                        <input
                          className="hidden"
                          type="text"
                          name={field.label}
                          id={`contact-${field.label}--${field._key}`}
                          value={fileUrl}
                          onChange={(e) => handleFileUpload(e)}
                          {...register(field.label)}
                        />
                        <Widget
                          onChange={(info) =>
                            setValue(field.label, info.cdnUrl)
                          }
                          publicKey="519bd94311a58315ac9a"
                          id={`contact-${field.label}--${field._key}`}
                        />
                      </div>
                    )}
                    {field._type == 'fieldDate' && (
                      <input
                        className={`bg-cream md:flex-grow p-10 h-full w-full`}
                        name={field.label}
                        type="date"
                        autoFill="off"
                        autoComplete="off"
                        id={`contact-${field.label}--${field._key}`}
                        {...register(field.label)}
                        onFocus={(e) => {
                          e.target.parentNode.classList.add('is-filled')
                        }}
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                      />
                    )}
                    {field._type == 'fieldList' && (
                      <div className="form-select--wrap">
                        <select
                          className={`bg-cream flex-grow p-10 h-full w-full`}
                          name={field.label}
                          type={null}
                          id={`contact-${field.label}--${field._key}`}
                          {...register(field.label)}
                          onFocus={(e) => {
                            e.target.parentNode.classList.add('is-filled')
                          }}
                          onChange={(e) => handleChange(e)}
                          onBlur={(e) => handleBlur(e)}
                        >
                          {field.options.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button className="mt-20 btn is-white" type="submit">
            Submit
          </button>
        </div>
      )}

      {error && <div>An error occured while submitting this form.</div>}

      {success && <div>{form.success}</div>}
    </form>
  )
}

export default Form
