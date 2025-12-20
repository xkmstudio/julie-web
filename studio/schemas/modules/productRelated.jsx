import { ShoppingBag } from 'phosphor-react'

export default {
  title: 'Product Related',
  name: 'productRelated',
  type: 'object',
  icon: ShoppingBag,
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
      title: 'Product',
      name: 'product',
      type: 'reference',
      to: [{ type: 'product' }],
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

