import { Article } from 'phosphor-react'

export default {
  title: 'Text Block',
  name: 'textBlock',
  type: 'object',
  icon: Article,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'string'
    },
    {
      title: 'Body',
      name: 'content',
      type: 'complexPortableText'
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'array',
      of: [{type: 'link'}],
      validation: Rule => Rule.max(1)
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
