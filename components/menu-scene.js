import React, { useRef, useMemo, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useRouter } from 'next/router'
import { OrthographicCamera } from '@react-three/drei'

import PagePlane from './menu-page-plane'

// Isometric camera setup
const ISOMETRIC_ANGLE = Math.PI / 6 // 30 degrees
const CAMERA_DISTANCE = 30
const PLANE_SPACING = 8 // Much more space between planes for better visibility
const PLANE_WIDTH = 20 // Consistent width for all planes
const PLANE_HEIGHT_RATIO = 1.414 // Standard page aspect ratio (A4-like)
const PLANE_HEIGHT = PLANE_WIDTH * PLANE_HEIGHT_RATIO // Height based on width
const SCROLL_SENSITIVITY = 0.5 // How fast scrolling moves through planes

const MenuScene = ({ pages = [], onNavigate }) => {
  const { size, gl } = useThree()
  const router = useRouter()
  const groupRef = useRef()
  const cameraRef = useRef()
  const targetScrollOffset = useRef(0)

  // Calculate camera bounds for orthographic view
  // Increased viewSize to allow planes to extend outside the frame
  const cameraBounds = useMemo(() => {
    const aspect = size.width / size.height
    const viewSize = 80 // Much larger to allow planes to extend outside frame
    return {
      left: -viewSize * aspect,
      right: viewSize * aspect,
      top: viewSize,
      bottom: -viewSize,
      near: 0.1,
      far: 500, // Much increased far plane for infinite scrolling depth
    }
  }, [size])

  // Set camera to look at center
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  // Handle scroll wheel with infinite looping
  useEffect(() => {
    if (!gl.domElement || pages.length === 0) return

    const handleWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Calculate scroll delta - scrolling down moves group backward (negative Z)
      const delta = e.deltaY * SCROLL_SENSITIVITY * 0.01
      targetScrollOffset.current -= delta
      
      // Infinite loop: wrap around seamlessly
      const maxOffset = pages.length * PLANE_SPACING
      
      // If we've scrolled past the end, loop back to the beginning
      if (targetScrollOffset.current < -maxOffset) {
        targetScrollOffset.current = targetScrollOffset.current + maxOffset
      }
      // If we've scrolled past the beginning, loop to the end
      else if (targetScrollOffset.current > 0) {
        targetScrollOffset.current = targetScrollOffset.current - maxOffset
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [gl.domElement, pages.length])

  // Smooth scroll animation with seamless looping
  useFrame(() => {
    if (groupRef.current && pages.length > 0) {
      const currentZ = groupRef.current.position.z
      const targetZ = targetScrollOffset.current
      const diff = targetZ - currentZ
      
      // Use easing for smooth scrolling
      groupRef.current.position.z += diff * 0.15
      
      // Handle seamless looping by wrapping position
      const maxOffset = pages.length * PLANE_SPACING
      if (groupRef.current.position.z < -maxOffset) {
        groupRef.current.position.z += maxOffset
        targetScrollOffset.current += maxOffset
      } else if (groupRef.current.position.z > 0) {
        groupRef.current.position.z -= maxOffset
        targetScrollOffset.current -= maxOffset
      }
    }
  })

  // Calculate positions for each page plane
  // Add extra spacing and slight offsets for better depth perception
  const planePositions = useMemo(() => {
    return pages.map((page, index) => {
      const zOffset = index * PLANE_SPACING
      // Reduced offsets for cleaner stacking
      const xOffset = index * 0.05 // Very slight horizontal offset for depth
      const yOffset = index * 0.05 // Very slight vertical offset
      
      return {
        x: xOffset,
        y: yOffset,
        z: zOffset, // Positive Z for stacking forward
        rotation: [0, 0, 0],
      }
    })
  }, [pages])

  const handlePlaneClick = (page) => {
    if (!page) return
    
    const slug = page.slug || page.page?.slug
    const isHome = page.isHome || page.page?.isHome
    const pageType = page.type || page.page?.type || 'page'
    
    let url = '/'
    
    if (isHome) {
      url = '/'
    } else if (pageType === 'product') {
      url = `/products/${slug}`
    } else if (pageType === 'collection') {
      url = `/shop/${slug}`
    } else if (pageType === 'tutorialsPage') {
      url = '/tutorials'
    } else if (slug) {
      url = `/${slug}`
    }
    
    router.push(url)
    
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[
          CAMERA_DISTANCE * Math.cos(ISOMETRIC_ANGLE),
          CAMERA_DISTANCE * Math.sin(ISOMETRIC_ANGLE),
          CAMERA_DISTANCE * Math.cos(ISOMETRIC_ANGLE)
        ]}
        left={cameraBounds.left}
        right={cameraBounds.right}
        top={cameraBounds.top}
        bottom={cameraBounds.bottom}
        near={cameraBounds.near}
        far={cameraBounds.far}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      <group ref={groupRef} position={[0, 0, 0]}>
        {pages.map((page, index) => {
          const position = planePositions[index]
          if (!position) return null
          
          return (
            <PagePlane
              key={page._id || page.slug || index}
              page={page}
              position={[position.x, position.y, position.z]}
              rotation={position.rotation}
              width={PLANE_WIDTH}
              height={PLANE_HEIGHT}
              onClick={() => handlePlaneClick(page)}
            />
          )
        })}
      </group>
    </>
  )
}

export default MenuScene

