import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Render the actual page in an iframe on the 3D plane
// This is much more efficient than generating screenshots!
const PagePlane = ({ page, position, rotation, width, height, onClick }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Build the page URL
  const getPageUrl = () => {
    const slug = page?.slug || page?.page?.slug
    const isHome = page?.isHome || page?.page?.isHome
    const pageType = page?.type || page?.page?.type || 'page'
    
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://shopteorema.netlify.app'
    
    if (isHome) {
      return baseUrl
    } else if (pageType === 'product') {
      return `${baseUrl}/products/${slug}`
    } else if (pageType === 'collection') {
      return `${baseUrl}/shop/${slug}`
    } else if (pageType === 'tutorialsPage') {
      return `${baseUrl}/tutorials`
    } else if (slug) {
      return `${baseUrl}/${slug}`
    }
    
    return baseUrl
  }
  
  const pageUrl = getPageUrl()
  
  // Convert 3D dimensions to pixel dimensions for iframe
  // Scale factor: 1 Three.js unit = 100px for reasonable iframe size
  // This makes the iframe 2000px wide (20 units * 100) which is good for page rendering
  const scaleFactor = 100
  const pixelWidth = width * scaleFactor
  const pixelHeight = height * scaleFactor

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(hovered ? 1.02 : 1, hovered ? 1.02 : 1, 1),
        0.1
      )
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={1}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.95}
        roughness={0.3}
        metalness={0.1}
        color="#ffffff"
      />
      {/* Render iframe with actual page content */}
      <Html
        transform
        occlude
        position={[0, 0, 0.01]} // Slightly in front of the plane
        style={{
          width: `${pixelWidth}px`,
          height: `${pixelHeight}px`,
          overflow: 'hidden',
          pointerEvents: 'none', // Disable pointer events on container
          transform: 'scale(1)',
        }}
        zIndexRange={[0, 0]}
        center={false}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: hovered ? 'auto' : 'none',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <iframe
            src={pageUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            scrolling="no"
            title={page?.title || 'Page Preview'}
            allow="same-origin"
            loading="lazy"
          />
        </div>
      </Html>
    </mesh>
  )
}

export default PagePlane
