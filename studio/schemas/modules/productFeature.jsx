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
      products: 'products'
    },
    prepare({ products }) {
      return {
        title: 'Featured Product',
        subtitle: `${products.length} ${
          products.length > 1 ? 'Products' : 'Product'
        }`,
        media: () => <Bag />
      }
    }
  }
}
