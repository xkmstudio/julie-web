import React from 'react'
import { contrastColor } from 'contrast-color'

import Photo from '@components/photo'

const Swatch = ({ label, color, children }) => {
  if (!color) return null

  // return (
  //   <div
  //     className="swatch"
  //     aria-label={label}
  //     style={{
  //       backgroundColor: color,
  //       '--swatchBorder': color
  //         ? contrastColor({ bgColor: color })
  //         : null,
  //     }}
  //   >
  //     {children}
  //   </div>
  // )
  return (
    <div className='swatch'>
      <img className='absolute left-0 top-0 w-full h-full object-cover scale-[1.1]' src={color} alt="product swatch"/>
    </div>
  )
}

export default Swatch
