import React from 'react'

export default {
  title: 'Video (Bleed)',
  name: 'videoBleed',
  type: 'object',
  fields: [
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'Must be a .mp4 file',
      options: {
        accept: 'video/mp4',
      },
    },
    {
      name: 'poster',
      title: 'Video Placeholder',
      description: '(Optional) Must be same aspect ratio as video.',
      type: 'image',
    },
    {
      name: 'autoplayDisabled',
      title: 'Disable Autoplay',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'title',
      video: 'video.asset.url'
    },
    prepare({ title, video }) {
      return {
        title: title || 'Video (Bleed)',
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

