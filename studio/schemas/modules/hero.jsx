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
