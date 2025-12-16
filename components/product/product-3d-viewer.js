import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Model component that loads and displays the GLB/GLTF
const Model = ({ url }) => {
  const { scene } = useGLTF(url)
  const modelRef = useRef()

  // Center and scale the model
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim

      scene.scale.multiplyScalar(scale)
      scene.position.sub(center.multiplyScalar(scale))
    }
  }, [scene])

  return <primitive ref={modelRef} object={scene} />
}

// Controls component that handles drag rotation
const DragControls = () => {
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      autoRotate={false}
    />
  )
}

// Main 3D Viewer Component
const Product3DViewer = ({ modelUrl, className = '' }) => {
  const containerRef = useRef()

  // Prevent scroll wheel from affecting the 3D scene - always allow page scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      // Stop propagation to prevent OrbitControls from handling the wheel event
      // This allows the page to scroll normally
      e.stopPropagation()
    }

    // Use capture phase to catch the event before it reaches the canvas
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [])

  if (!modelUrl) return null

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="w-full h-full"
        onWheel={(e) => {
          // Prevent the canvas from handling wheel events
          e.stopPropagation()
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <Environment preset="city" />
          <Model url={modelUrl} />
          <DragControls />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Product3DViewer

