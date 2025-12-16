import { Package } from 'phosphor-react'

export default {
  title: 'Product Contents',
  name: 'productContents',
  type: 'object',
  icon: Package,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Contents',
      name: 'contents',
      type: 'array',
      of: [
        {
          title: 'Item',
          name: 'item',
          type: 'object',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string'
            },
            {
              title: 'Media',
              name: 'media',
              type: 'media'
            }
          ]
        },
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

