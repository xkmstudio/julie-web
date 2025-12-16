import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

import Screen from '@components/scene/screen'
import Camera from '@components/scene/camera'

// import AsciiRenderer from './ascii'

const Scene = ({ hero, muted = false, viewReel, type = 'hero' }) => {
  const videoRef = useRef()

  // supress warning from @react-three/spring until they release a fix
  console.warn = () => {}

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => {
        console.error('Error playing video in Safari:', e)
      })
    }
  }, [hero])

  return (
    <div className={`w-full h-full`}>
      {type != 'footer' && (
        <div className={`absolute left-0 top-0 w-screen h-hero md:h-screen`}>
          <video
            className={`w-[.1rem] object-cover opacity-0`}
            crossOrigin="Anonymous"
            ref={videoRef}
            autoPlay
            playsInline
            loop
            muted={muted}
            src={hero}
            preload="auto"
          />
        </div>
      )}
      <Canvas
        // gl={{
        //   outputEncoding: THREE.sRGBEncoding, // Good, expected
        //   toneMapping: THREE.NoToneMapping,   // <- This fixes the extra contrast/saturation

        // }}
        // onClick={() => setViewReel(!viewReel)}
        shadows={false}
        dpr={[1, 1.5]}
        className={`w-screen h-[42vw]`}
      >
        <Camera viewReel={viewReel} />
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="gray" />
            </mesh>
          }
        >
          <Environment
            intensity={0.1}
            files="/models/studio_1k_bw.hdr"
            background={false}
          />
          {/* <directionalLight intensity={.2} position={[5, 1, 5]} /> */}
          <Screen type={type} src={videoRef} viewReel={viewReel} />
        </Suspense>
        {/* {type == 'footer' && <AsciiRenderer />} */}
      </Canvas>
    </div>
  )
}

export default Scene
