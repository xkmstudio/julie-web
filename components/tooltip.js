import React, { useRef, useEffect, useState } from 'react'

const ToolTip = ({ title }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(1)
  const toolTip = useRef()

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={toolTip}
      style={{
        opacity: position.x == 0 ? 0 : opacity,
        left: position.x + 15,
        top: position.y + 10,
      }}
      className="tooltip hidden md:block absolute z-9 pointer-events-none whitespace-nowrap transition-opacity duration-300 text-slate mix-blend-difference"
    >
      {title}
    </div>
  )
}

export default ToolTip
