import React, { useState, useEffect, useRef } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { useWindowSize } from '@lib/helpers'
import { gsap } from 'gsap'

const Camera = ({ viewReel }) => {
  const { height: windowHeight, width } = useWindowSize()
  const cameraRef = useRef()
  const [cameraZ, setCameraZ] = useState(width < 950 ? 170 : 100)
  const hasMounted = useRef(false) // Track initial render

  useEffect(() => {
    setCameraZ(width < 950 ? 170 : 100)
  }, [width])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return // Skip animation on initial mount
    }

    if (cameraRef.current) {
      const targetZ = viewReel ? (width < 950 ? 90 : 50) : (width < 950 ? 170 : 100)
      gsap.to(cameraRef.current.position, {
        z: targetZ,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => setCameraZ(cameraRef.current.position.z)
      })
    }
  }, [viewReel]) // Only run when viewReel changes

  return (
    <PerspectiveCamera
      ref={cameraRef}
      position={[0, 0, cameraZ]}
      fov={24}
      near={0.1}
      far={1000}
      dpr={[1, 1]}
      makeDefault
    />
  )
}

export default Camera
