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
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        }
      ],
    }
  ],
  preview: {
    select: {
      products: 'products'
    },
    prepare({ products }) {
      return {
        title: 'Collection',
        subtitle: `${products.length} ${
          products.length > 1 ? 'Products' : 'Product'
        }`,
        media: () => <Bag />
      }
    }
  }
}
