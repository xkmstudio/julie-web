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
      image: 'image'
    },
    prepare({ title, image }) {
      return {
        title: title,
        media: image
      }
    }
  }
}
