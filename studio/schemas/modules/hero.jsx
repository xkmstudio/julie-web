import { Star } from 'phosphor-react'

export default {
  title: 'Hero',
  name: 'hero',
  type: 'object',
  icon: Star,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'simplePortableText'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'simplePortableText'
    },
    {
      title: 'Mobile Tag',
      name: 'mobileTag',
      type: 'string',
      description: 'This will be displayed on the mobile at the bottom and stretch the hero to the bottom of the screen',
    },
    {
      title: 'Background Media',
      name: 'backgroundMedia',
      type: 'media'
    },
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
