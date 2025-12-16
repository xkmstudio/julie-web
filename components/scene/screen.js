import React, { Suspense, useRef, useEffect, useState } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useSpring, animated, Globals } from '@react-spring/three'
import { easings } from '@react-spring/web'
import { TextureLoader } from 'three'
import { useWindowSize } from '@lib/helpers'
import { useSiteContext, useSceneLoaded } from '@lib/context'
import * as THREE from 'three'
import throttle from 'lodash.throttle'

const degToRad = (degrees) => degrees * (Math.PI / 180)

Globals.assign({
  frameLoop: 'always',
})

const Screen = ({ src, viewReel, type }) => {
  useGLTF.preload('/models/marcd_stone_smooth.gltf') // Preload the model

  const { width } = useWindowSize()
  const { sceneLoaded } = useSiteContext()
  const innerRef = useRef()
  const videoRef = useRef()
  const meshRef = useRef()
  const prevMouse = useRef({ x: 0, y: 0 })

  const setSceneLoaded = useSceneLoaded()

  useEffect(() => {
    // const handleMouseMove = (event) => {
    //   const { clientX, clientY } = event
    //   const x = (clientX / window.innerWidth) * 2 - 1
    //   const y = -(clientY / window.innerHeight) * 2 + 1
    //   prevMouse.current = { x, y }
    // }

    const handleMouseMove = throttle((event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      prevMouse.current = { x, y }
    }, 100) // Throttle to 100ms

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    const { x, y } = prevMouse.current
    if (width > 950) {
      if (meshRef.current && !viewReel) {
        const xRotation = y * degToRad(10)
        const yRotation = x * degToRad(10)
        // meshRef.current.rotation.x = THREE.MathUtils.lerp(
        //   meshRef.current.rotation.x,
        //   xRotation * -1,
        //   0.1
        // )
        // meshRef.current.rotation.y = THREE.MathUtils.lerp(
        //   meshRef.current.rotation.y,
        //   yRotation * 1,
        //   0.1
        // )
        if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01) {
          // Avoid updates if negligible
          meshRef.current.rotation.x = THREE.MathUtils.lerp(
            meshRef.current.rotation.x,
            y * degToRad(-10),
            0.1
          )
          meshRef.current.rotation.y = THREE.MathUtils.lerp(
            meshRef.current.rotation.y,
            x * degToRad(10),
            0.1
          )
        }
      } else if (meshRef.current) {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
          meshRef.current.rotation.x,
          0,
          0.1
        )
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          0,
          0.1
        )
      }
    } else if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        0,
        0.1
      )

      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        0,
        0.1
      )
    }
  })

  function ScreenMesh() {
    const { nodes } = useGLTF('/models/marcd_stone_smooth.gltf', true) // Cached load
    const [bumpMap] = useLoader(TextureLoader, ['/models/stone_nm_1k.jpg'])

    useEffect(() => {
      if (bumpMap) {
        bumpMap.center.set(0.5, 0.5)
        bumpMap.rotation = degToRad(270)
        bumpMap.repeat.set(1, 1)
        bumpMap.offset.set(0, 0)
      }
    }, [bumpMap])

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.flipY = true
        videoRef.current.rotation = degToRad(180)
        videoRef.current.center.set(0.5, 0.5)
        videoRef.current.repeat.set(1, -1)
        videoRef.current.offset.set(0, 0)
      }
    }, [videoRef])

    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.layers.set(1) // Set layer 1 for the ASCII effect
      }
    }, [])

    return (
      <group rotation={[0, degToRad(180), 0]} ref={innerRef}>
        
        <mesh ref={innerRef} geometry={nodes.marcd_stone_smooth003_2.geometry}>
          <meshStandardMaterial
            color={0x888888}
            metalness={1}
            roughness={0.1}
            bumpMap={bumpMap}
            bumpScale={0.3}
          />
        </mesh>
      </group>
    )
  }

  // const { rotation } = useSpring({
  //   rotation: sceneLoaded ? [0, 0, 0] : [0, degToRad(180), 0],
  //   config: {
  //     duration: 2000,
  //     easing: easings.easeInOutExpo,
  //   },
  //   immediate: !sceneLoaded,
  // })

  useEffect(() => {
    setTimeout(() => {
      setSceneLoaded(true)
    }, 200)
  }, [])

  const { rotation } = useSpring({
    rotation: sceneLoaded ? [0, 0, 0] : [0, degToRad(180), 0],
    config: {
      duration: 2000,
      easing: easings.easeInOutExpo,
    },
    immediate: !sceneLoaded,
  })

  return (
    <Suspense fallback={null}>
      <animated.group ref={meshRef} rotation={rotation} dispose={null}>
        <ScreenMesh />
      </animated.group>
    </Suspense>
  )
}

export default React.memo(Screen)
