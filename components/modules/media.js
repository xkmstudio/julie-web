import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import Photo from '@components/photo'

const ImageFull = ({ data = {}, isProject, isModal }) => {
  const { image, caption, layout } = data

  return (
    <div
      className={`mx-auto max-w-[120rem] w-full${
        isProject ? ` h-full absolute top-0 left-0` : isModal ? ' relative' : ' p-10 relative'
      }`}
    >
      {image && (
        <div
          className={`w-full`}
        >
          <Photo
            photo={image}
            width={1600}
            srcSizes={[800, 1000, 1200, 1600]}
            sizes="100%"
            layout={'intrinsic'}
            className={
              isProject ? 'h-full' : 'w-full'
            }
          />
          {/* {caption && !isProject && (
            <div className="w-full project-caption text-center">
              <div className="w-full project-caption--inner">{caption}</div>
            </div>
          )} */}
        </div>
      )}
    </div>
  )
}

export default ImageFull
