import React, { useState } from 'react'
import cx from 'classnames'

const SizingChart = ({ chartData }) => {
  const [unit, setUnit] = useState('cm') // 'cm' or 'in'

  if (!chartData || !chartData.sizes || !chartData.measurements) return null

  const { sizes, measurements } = chartData

  // Ensure sizes and measurements are arrays
  if (!Array.isArray(sizes) || !Array.isArray(measurements)) return null

  // Filter out any empty sizes or measurements
  const validSizes = sizes.filter(Boolean)
  const validMeasurements = measurements.filter(Boolean)

  if (validSizes.length === 0 || validMeasurements.length === 0) return null

  // Convert values based on unit
  const convertValue = (value, fromUnit) => {
    if (fromUnit === unit) return value
    if (fromUnit === 'cm' && unit === 'in') {
      return (value / 2.54).toFixed(2)
    }
    if (fromUnit === 'in' && unit === 'cm') {
      return (value * 2.54).toFixed(2)
    }
    return value
  }

  return (
    <div className="sizing-chart">
      <div className="flex items-center justify-between bg-cement p-10">
        <h3 className="title-normal">GARMENT MEASUREMENTS</h3>
        <div className="flex items-center gap-10">
          <button
            onClick={() => setUnit('cm')}
            className={cx(
              'uppercase transition-colors',
              unit === 'cm' ? 'text-black font-vm' : 'text-dim'
            )}
          >
            CM
          </button>
          <span className="text-dim">/</span>
          <button
            onClick={() => setUnit('in')}
            className={cx(
              'uppercase transition-colors',
              unit === 'in' ? 'text-black font-vm' : 'text-dim'
            )}
          >
            IN
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-b-0 border-cement text-12">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left uppercase p-10 border-b border-cement"></th>
              {validSizes.map((size, index) => (
                <th
                  key={index}
                  className="text-right uppercase p-10 border-b border-cement font-vm font-normal"
                >
                  <div className="flex items-center justify-end gap-5">
                    <span>{size.label}</span>
                    <span>|</span>
                    {size.italianSize && (
                      <span className="">IT{size.italianSize}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validMeasurements.map((measurement, mIndex) => (
              <tr key={mIndex}>
                <td className="text-left uppercase p-10 border-b border-cement font-medium">
                  {measurement.name}
                </td>
                {validSizes.map((size, sIndex) => {
                  const value = measurement.values?.[sIndex]
                  const displayValue = value
                    ? convertValue(value, measurement.unit || 'cm')
                    : '-'
                  return (
                    <td
                      key={sIndex}
                      className="text-right p-10 border-b border-cement"
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SizingChart

