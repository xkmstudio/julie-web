import { Presentation } from 'phosphor-react'

export default {
  title: 'Slideshow',
  name: 'slideshow',
  type: 'object',
  icon: Presentation,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Slides',
      name: 'slides',
      type: 'array',
      of: [
        {
          title: 'Slide',
          name: 'slide',
          type: 'object',
          fields: [
            {
              title: 'Media',
              name: 'media',
              type: 'media'
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string'
            },
          ]
        }
      ]
    }

  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title,
      }
    }
  }
}

