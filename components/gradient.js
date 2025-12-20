import React from 'react'

const Gradient = ({ gradient }) => {
  const { type, direction, customAngle, colorStops, height, padding } = gradient

  if (!colorStops || colorStops.length < 2) {
    return null
  }

  // Build the gradient CSS value
  const buildGradientString = () => {
    // Determine the direction/angle
    const gradientDirection = customAngle || direction || 'to bottom'

    // Build color stops string
    const stopsString = colorStops
      .map((stop) => {
        const color = stop?.color
        const position = stop?.position ?? 0

        if (!color) return null

        // Use hex with alpha if available, otherwise just hex
        let colorValue = color.hex || '#000000'
        
        // Handle alpha transparency
        const alpha = color.alpha !== undefined ? color.alpha : (color.rgb?.a !== undefined ? color.rgb.a : 1)
        
        if (alpha < 1) {
          // Convert to rgba for alpha support
          const rgb = color.rgb || {}
          return `rgba(${rgb.r || 0}, ${rgb.g || 0}, ${rgb.b || 0}, ${alpha}) ${position}%`
        }

        return `${colorValue} ${position}%`
      })
      .filter(Boolean)
      .join(', ')

    if (type === 'radial') {
      return `radial-gradient(circle, ${stopsString})`
    } else {
      return `linear-gradient(${gradientDirection}, ${stopsString})`
    }
  }

  const gradientString = buildGradientString()

  // Build style object
  const style = {
    background: gradientString,
    ...(height && { height }),
    ...(padding && { padding }),
  }

  return (
    <div
      className="w-full"
      style={style}
      aria-label={data.title ? `Gradient: ${data.title}` : 'Gradient background'}
    />
  )
}

export default Gradient
