import { Bag } from 'phosphor-react'

export default {
  title: 'Featured Products',
  name: 'productFeature',
  type: 'object',
  icon: Bag,
  fields: [
    {
      title: 'Products',
      name: 'products',
      type: 'array',
      description: 'Select up to 4 products to feature',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        }
      ],
      validation: Rule => Rule.max(4).unique().error('Maximum 4 products allowed, and each product can only be added once')
    }
  ],
  preview: {
    select: {
      products: 'products',
      firstProduct: 'products.0.title',
      firstProductImage: 'products.0.listingPhoto'
    },
    prepare({ products, firstProduct, firstProductImage }) {
      const productsCount = products?.length || 0
      const displayTitle = 'Featured Products'
      const subtitleParts = [
        productsCount > 0 && `${productsCount} product${productsCount > 1 ? 's' : ''}`,
        firstProduct && `"${firstProduct}"`
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Featured Products',
        media: firstProductImage || Bag
      }
    }
  }
}
