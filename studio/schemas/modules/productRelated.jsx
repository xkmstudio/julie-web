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
      title: 'Products',
      name: 'products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        }
      ],
      validation: Rule => Rule.max(4).unique()
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

