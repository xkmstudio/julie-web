import React from 'react'
import CustomVideoInput from '../../components/custom-video'

export default {
  title: 'Video',
  name: 'videoExternal',
  type: 'object',
  fields: [
    {
      name: 'video',
      title: 'Video',
      type: 'string',
      description: 'Paste the vimeo file link',
    },
    {
      name: 'poster',
      title: 'Video Placeholder',
      description: '(Optional) Must be same aspect ratio as video.',
      type: 'image',
      // hidden: true,
    },
  ],
  components: {
    input: CustomVideoInput
  },
  // inputComponent: CustomVideoInput,
  preview: {
    select: {
      title: 'title',
      video: 'video'
    },
    prepare({ title, video }) {
      return {
        title: title || 'Video',
        media: video ? (
          <div style={{ width: '100%', height: '100%' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              src={video}
            ></video>
          </div>
        ) : null
      }
    }
  }
}
