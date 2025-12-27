import React from 'react'
import cx from 'classnames'

import { hasObject } from '@lib/helpers'

import RadioGroup from '@components/radio-group'
import RadioItem from '@components/radio-item'

const ProductOption = ({
  option,
  optionsAmount,
  position,
  variants,
  activeVariant,
  strictMatch = true,
  hideLabels,
  onChange,
  type,
}) => {
  const otherOpts = [
    ...activeVariant.options.slice(0, position),
    ...activeVariant.options.slice(position + 1),
  ]

  return (
    <div
      key={position}
      className={`option is-${option.name.toLowerCase().replace(' ', '-')}`}
    >
      {!hideLabels && (
        <div className="option--title gap-5 mb-15 text-14 hidden">
          <span className="text-smoke">{option.name}:</span>
          {optionsAmount < 2 && <span>{activeVariant?.title}</span>}
        </div>
      )}

      <RadioGroup
        value={
          activeVariant?.options.find((opt) => opt.name === option.name)?.value
        }
        onChange={(value) => {
          changeOption(option.name, value, variants, activeVariant, onChange)
        }}
        className="option--values flex flex-wrap gap-10"
      >
        {option.values.map((value, key) => {
          let optionData = variants?.find((v) => v.title == value)
          const currentOpt = [{ name: option.name, value: value }]

          const isActive = activeVariant.options.some(
            (opt) => opt.position === option.position && opt.value === value
          )

          const withActiveOptions = [...currentOpt, ...otherOpts]

          const hasVariants = variants.find((variant) =>
            variant.options.every((opt) => hasObject(withActiveOptions, opt))
          )

          const inStock = variants.find((variant) => {
            if (strictMatch) {
              return (
                variant.inStock &&
                variant.options.every((opt) =>
                  hasObject(withActiveOptions, opt)
                )
              )
            } else {
              return (
                variant.inStock &&
                variant.options.some((opt) => hasObject(currentOpt, opt))
              )
            }
          })

          return (
            <RadioItem
              key={key}
              title={`${option.name}: ${value}`}
              value={value}
              className={cx('',{
                'btn is-variant': true,
                'is-active': isActive,
                'is-unavailable': !hasVariants,
                'is-soldout': !inStock && hasVariants && !isActive,
              })}
            >
              {value}
            </RadioItem>
          )
        })}
      </RadioGroup>
    </div>
  )
}

// handle option changes
const changeOption = (name, value, variants, activeVariant, changeCallback) => {
  const newOptions = activeVariant.options.map((opt) =>
    opt.name === name ? { ...opt, value: value } : opt
  )

  const newVariant = variants.find((variant) =>
    variant.options.every((opt) => hasObject(newOptions, opt))
  )

  if (newVariant && changeCallback) {
    changeCallback(newVariant.id)
  }
}

export default ProductOption
