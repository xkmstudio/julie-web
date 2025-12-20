import { List } from 'phosphor-react'

export default {
  title: 'Index List',
  name: 'indexList',
  type: 'object',
  icon: List,
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

