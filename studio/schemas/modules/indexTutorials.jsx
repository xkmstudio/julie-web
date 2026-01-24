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
      of: [{type: 'link'}],
      validation: Rule => Rule.max(1)
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      products: 'products',
      firstProduct: 'products.0.title',
      hasCta: 'cta.0'
    },
    prepare({ title, subtitle, products, firstProduct, hasCta }) {
      const displayTitle = title || 'Index Tutorials'
      const productsCount = products?.length || 0
      const subtitleParts = [
        subtitle && `"${subtitle}"`,
        productsCount > 0 && `${productsCount} product${productsCount === 1 ? '' : 's'}`,
        firstProduct && `"${firstProduct}"`,
        hasCta && '✓ CTA'
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Index Tutorials',
        media: List
      }
    }
  }
}

