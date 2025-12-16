import { List } from 'phosphor-react'

export default {
  title: 'Index Tutorials',
  name: 'indexTutorials',
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
      title: 'Products',
      name: 'products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }]
        }
      ],
      description: 'Select products that have tutorials'
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'array',
      of: [{type: 'navPage'}, {type: 'navLink'}],
      validation: Rule => Rule.max(1)
    },
  ],
  preview: {
    select: {
      title: 'title',
      products: 'products'
    },
    prepare({ title, products }) {
      return {
        title: title || 'Index Tutorials',
        subtitle: products ? `${products.length} ${products.length === 1 ? 'product' : 'products'}` : 'No products'
      }
    }
  }
}

