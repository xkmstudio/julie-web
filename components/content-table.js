import React from 'react'
import { PortableText } from '@portabletext/react'

const COLUMN_ORDER = {
  2: ['left', 'right'],
  3: ['left', 'middle', 'right'],
  4: ['left', 'middle', 'right', 'col4'],
  5: ['left', 'middle', 'right', 'col4', 'col5'],
  6: ['left', 'middle', 'right', 'col4', 'col5', 'col6'],
}

export const getTableColumns = (count) => {
  const parsed = Number(count)
  return COLUMN_ORDER[parsed] || COLUMN_ORDER[2]
}

const hasPortableText = (value) => Array.isArray(value) && value.length > 0

const ContentTable = ({ value, cellComponents, footnoteComponents }) => {
  if (!value?.rows || value.rows.length === 0) return null

  const columns = getTableColumns(value.columns)
  const columnCount = columns.length
  const isFaq = columnCount === 2 && !value.hasHeader
  const hasHeader = Boolean(value.hasHeader)
  const headers = {
    left: value.headers?.left || value.headerLeft,
    middle: value.headers?.middle || value.headerMiddle,
    right: value.headers?.right || value.headerRight,
    col4: value.headers?.col4 || value.headerCol4,
    col5: value.headers?.col5 || value.headerCol5,
    col6: value.headers?.col6 || value.headerCol6,
  }
  const explicitBoldColumns = Array.isArray(value.boldColumns)
  const boldColumns = new Set(
    explicitBoldColumns
      ? value.boldColumns
          .map((index) => columns[Number(index) - 1])
          .filter(Boolean)
      : isFaq
        ? ['left']
        : []
  )
  const isComparison = columnCount >= 3
  const isWide = columnCount >= 4
  const colWidth = `${100 / columnCount}%`

  const cellClassName = (key, { isHeader = false, rowBold = false, isLastCol = false, isLastRow = false } = {}) => {
    const isBold = isHeader || rowBold || boldColumns.has(key)
    const borders = [
      !isLastCol && 'border-r border-pink',
      !isHeader && !isLastRow && 'border-b border-pink',
    ].filter(Boolean).join(' ')

    if (isHeader) {
      const headerBorders = !isLastCol ? 'border-r border-white/30' : ''
      return `p-10 md:p-15 text-left align-bottom bg-pink text-white font-lxb text-16 md:text-18 leading-110 ${headerBorders}`
    }

    if (isFaq && key === 'left' && (!explicitBoldColumns || boldColumns.has('left'))) {
      return `p-10 md:p-15 bg-white text-pink font-lxb text-16 md:text-18 ${borders}`
    }

    if (isFaq) {
      const emphasis = isBold ? 'font-bold font-vb' : ''
      const surface = rowBold ? 'bg-pink/15' : 'bg-pink/10'
      return `p-10 md:p-15 text-16 md:text-18 ${surface} ${emphasis} ${borders}`
    }

    const emphasis = isBold ? 'font-bold font-vb' : ''
    const surface = rowBold ? 'bg-pink/10' : 'bg-white'

    return `p-10 md:p-15 align-top text-16 md:text-18 ${surface} ${emphasis} ${borders}`
  }

  return (
    <div className={`content-table my-40${isComparison ? ' is-comparison' : ''}${isWide ? ' is-wide' : ''}`}>
      {value.title && (
        <div
          role="heading"
          aria-level={3}
          className="content-table-title font-lxb text-pink text-24 md:text-32 mb-20 leading-tight text-left"
        >
          {value.title}
        </div>
      )}
      <div className={`content-table-wrap border border-pink rounded-[1.5rem] ${isWide ? 'overflow-x-auto' : 'overflow-hidden'}`}>
        <table
          className={`w-full border-collapse ${isComparison ? 'table-fixed' : ''}`}
          style={isWide ? { minWidth: `${columnCount * 16}rem` } : undefined}
        >
          {hasHeader && (
            <thead>
              <tr>
                {columns.map((key, index) => (
                  <th
                    key={key}
                    scope="col"
                    style={{ width: colWidth }}
                    className={cellClassName(key, {
                      isHeader: true,
                      isLastCol: index === columnCount - 1,
                    })}
                  >
                    {headers[key] || ''}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {value.rows.map((row, rowIndex) => {
              const isLastRow = rowIndex === value.rows.length - 1

              return (
                <tr key={row._key || rowIndex} className="align-top">
                  {columns.map((key, index) => (
                    <td
                      key={key}
                      style={{ width: colWidth }}
                      className={cellClassName(key, {
                        rowBold: Boolean(row.bold),
                        isLastCol: index === columnCount - 1,
                        isLastRow,
                      })}
                    >
                      {hasPortableText(row[key]) && (
                        <PortableText
                          value={row[key]}
                          components={cellComponents}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {hasPortableText(value.footnote) && (
        <div className="content-table-footnote text-slate mt-15">
          <PortableText
            value={value.footnote}
            components={footnoteComponents}
          />
        </div>
      )}
    </div>
  )
}

export default ContentTable
