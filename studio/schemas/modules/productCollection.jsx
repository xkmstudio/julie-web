import { Bag } from 'phosphor-react'

export default {
  title: 'Collection',
  name: 'productCollection',
  type: 'object',
  icon: Bag,
  fields: [
    {
      title: 'Products',
      name: 'products',
      type: 'array',
      description: 'Select products to display in this collection',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        }
      ],
      validation: Rule => Rule.min(1).error('At least one product is required')
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
      const displayTitle = 'Collection'
      const subtitleParts = [
        productsCount > 0 && `${productsCount} product${productsCount > 1 ? 's' : ''}`,
        firstProduct && `"${firstProduct}"`
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Collection',
        media: firstProductImage || Bag
      }
    }
  }
}
