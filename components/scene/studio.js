import React, { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Studio({ message, ...props }) {
  const desk = useGLTF('/models/studio_draco.gltf')
  var meshArray = Object.values(desk.nodes)
  const nodes = Object.values(desk.nodes)

  meshArray.forEach((mesh, i) => {
    if (mesh.isMesh) {
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })

  useEffect(() => {
    if (desk) {
      setTimeout(() => {
        document.body.classList.add('scene-loaded')
      }, 500)
    }
  }, [desk])

  return (
    <Suspense fallback={null}>
      {/* <primitive onClick={(e) => console.log('click')} object={desk.scene} /> */}

      <group {...props} dispose={null}>
        {nodes.map((node, key) => {
          if (!node.isMesh) return null
          const mat = node.material?.name

          const nodeTitle = mat.includes('lamp')
            ? 'You clicked our Lamp'
            : mat.includes('mug')
            ? 'You clicked our mug'
            : mat.includes('lambert')
            ? 'You clicked our recycling bin'
            : null

          const nodeMessage = mat.includes('lamp')
            ? 'We are available all hours'
            : mat.includes('mug')
            ? 'We are drinking Man Eating Tiger'
            : mat.includes('lambert')
            ? 'Where we throw old ideas'
            : null

          return (
            <mesh
              onClick={
                nodeMessage ? () => message(nodeTitle, nodeMessage) : null
              }
              key={key}
              // castShadow
              // receiveShadow
              geometry={node.geometry}
              material={node.material}
              position={node.position}
              rotation={[Math.PI / 2, 0, 0]}
            />
          )
        })}
      </group>
    </Suspense>
  )
}

useGLTF.preload('/models/studio_draco.gltf')
