import React from 'react'

export default {
  title: 'Video Tutorial',
  name: 'videoTutorial',
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
      name: 'sections',
      title: 'Video Sections',
      description: 'Add section markers for navigation. Format timestamp as MM:SS (e.g., 1:45)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'string',
              description: 'Format as MM:SS (e.g., 1:45)',
              validation: Rule => Rule.required().regex(/^[0-9]+:[0-5][0-9]$/, {
                name: 'timestamp',
                invert: false
              }).error('Must be in MM:SS format (e.g., 1:45)')
            },
            {
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: Rule => Rule.required()
            }
          ],
          preview: {
            select: {
              timestamp: 'timestamp',
              title: 'title'
            },
            prepare({ timestamp, title }) {
              return {
                title: title || 'Untitled Section',
                subtitle: timestamp || 'No timestamp'
              }
            }
          }
        }
      ]
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
        title: title || 'Video Tutorial',
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

