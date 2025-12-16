import { Package } from 'phosphor-react'

export default {
  title: 'Product Construction',
  name: 'productConstruction',
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
            },
            {
              title: 'Pattern',
              name: 'pattern',
              type: 'asset'
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

