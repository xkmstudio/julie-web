import { Camera } from 'phosphor-react'

export default {
  title: 'Asset',
  name: 'asset',
  type: 'object',
  icon: Camera,
  fields: [
    {
      title: 'Image',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true
      },
    },
    {
      title: 'Alt Text',
      name: 'alt',
      type: 'string',
      description: 'A short description for accessibility and SEO.'
    }
  ],
  preview: {
    select: {
      title: 'alt',
      image: 'image',
      filename: 'image.asset.originalFilename'
    },
    prepare({ title, image, filename }) {
      const displayTitle = title || filename || 'Asset'
      
      return {
        title: displayTitle,
        media: image || Camera
      }
    }
  }
}
