import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'

import cx from 'classnames'

import { useParams, usePrevious, cartesian, clampRange } from '@lib/helpers'
import { useSiteContext } from '@lib/context'

import Icon from '@components/icon'

export function filterItems(items, tags, limit, className) {
  const paginationLimit = limit ? limit : 30

  const { isPageTransition } = useSiteContext()

  const sectionItems = useRef([])

  const [hasPagination, setHasPagination] = useState(
    paginationLimit > 0 && items.length > paginationLimit
  )
  const [currentCount, setCurrentCount] = useState(
    hasPagination ? paginationLimit : items.length
  )

  const [currentParams, setCurrentParams] = useParams([
    {
      name: 'page',
      value: null,
    },
    {
      name: 'tag',
      value: null,
    }
  ])

  const filterGroups = [
    { slug: 'tag', options: tags },
  ]

  const previousParams = usePrevious(currentParams)

  // determine which params set to use
  const activeParams =
    isPageTransition && previousParams ? previousParams : currentParams

  // calculate our filters
  const currentFilters = activeParams.filter((f) => !['page'].includes(f.name))
  // const activeFilters = currentFilters.map((filter) => {
  //   const validOptions = tags.map((o) => o.slug)

  //   const currentOptions = Array.isArray(filter.value)
  //     ? filter.value
  //     : filter.value?.split(',') || []

  //   return {
  //     name: filter.name,
  //     values: [
  //       ...new Set(
  //         currentOptions
  //           .filter(Boolean)
  //           .filter((f) => validOptions?.includes(f))
  //       ),
  //     ],
  //   }
  // })

  const activeFilters = currentFilters.map((filter) => {
    const validOptions = filterGroups
      .find((g) => g.slug === filter.name)
      ?.options.map((o) => o.slug)

    const currentOptions = Array.isArray(filter.value)
      ? filter.value
      : filter.value?.split(',') || []

    return {
      name: filter.name,
      values: [
        ...new Set(
          currentOptions
            .filter(Boolean)
            .filter((f) => validOptions?.includes(f))
        ),
      ],
    }
  })

  // calculate our product order and pagination
  const orderedItems = useFilterAndSort(items, activeFilters)
  const paginatedItems = [...orderedItems.slice(0, currentCount)]

  // handle filter + sort updates
  const updateParams = useCallback(
    (params) => {
      const newFilters = activeParams.map((filter) => {
        const matchedParam = params?.find((p) => p.name === filter.name)

        return matchedParam ? { ...filter, value: matchedParam?.value } : filter
      })

      setCurrentParams(newFilters)
    },
    [activeParams]
  )

  // handle load more
  const loadMore = useCallback(() => {
    const newCount = clampRange(
      currentCount + paginationLimit,
      1,
      orderedItems.length
    )

    const newPage = Math.ceil(newCount / paginationLimit)

    setCurrentCount(newCount)
    updateParams([{ name: 'page', value: newPage > 1 ? `${newPage}` : null }])
  }, [currentCount, orderedItems, paginationLimit])

  // update pagination when the count or clients change
  useEffect(() => {
    const desiredPage = activeParams.find((p) => p.name === 'page').value
    const maxPage = Math.ceil(orderedItems.length / paginationLimit)

    const newCount =
      desiredPage > 1 && desiredPage <= maxPage
        ? clampRange(paginationLimit * desiredPage, 1, orderedItems.length)
        : null

    const pageEventIndex =
      newCount < orderedItems?.length
        ? newCount - paginationLimit
        : orderedItems.length - 1

    if (newCount) {
      setCurrentCount(newCount)
      sectionItems.current[pageEventIndex]?.querySelector('[href]').focus({
        prclientscroll: true,
      })
    }

    setHasPagination(currentCount < orderedItems.length)
  }, [currentCount, orderedItems, activeParams, paginationLimit, sectionItems])

  function useFilterAndSort(items, filters) {
    const filterCombos = useMemo(
      () =>
        cartesian(
          ...filters.filter((f) => f.values.length).map((f) => f.values)
        ),
      [filters]
    )

    const filterItems = useMemo(
      () =>
        items.filter((item) => {

          const allFilters = item.tags

          return filterCombos.some((combo) => {
            const itemTags = allFilters?.map((f) => f.slug)
            const hasCombo = combo.every((x) => itemTags?.includes(x))

            return hasCombo
          })
        }),
      [filters]
    )

    return filterItems
  }

  return {
    activeFilters: activeFilters,
    updateParams: updateParams,
    paginatedItems: paginatedItems,
    loadMore: loadMore,
    hasPagination: hasPagination,
  }
}

// Build out our filter option
export const FilterOption = ({
  option,
  activeOptions,
  onChange,
  className = 'btn',
  isList,
  count
}) => {
  const { title, slug } = option

  const { name: filterGroup, values } = activeOptions

  const isChecked = values?.includes(slug)

  function handleFilterChange(ev) {
    const { value } = ev.target

    const hasValue = values.includes(value)

    const newValues = hasValue
      ? values.filter((v) => v !== value).join()
      : [...values, value].join()

    onChange([
      {
        name: filterGroup,
        value: newValues || null,
      },
    ])
  }

  return (
    <div
      className={cx(`control`, className, {
        'is-active': isChecked,
        'list-view': isList,
      })}
    >
      <input
        id={`filter-${slug}`}
        name={filterGroup}
        className="hidden"
        type="checkbox"
        value={slug}
        checked={values?.includes(slug) || false}
        onChange={handleFilterChange}
      />
      <label
        htmlFor={`filter-${slug}`}
        className={`control--label for-checkbox flex items-center`}
      >
        <div className="btn-filter--inner"><div className='text-slate'>{count}</div><div>{title}</div></div>
      </label>
    </div>
  )
}
