import { VideoCamera } from 'phosphor-react'

export default {
    title: 'Tutorials',
    name: 'tutorials',
    type: 'object',
    icon: VideoCamera,
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
                    to: [{ type: 'product' }]
                }
            ],
            description: 'Select products that have tutorials'
        }
    ],
    preview: {
        select: {
            title: 'title',
            products: 'products'
        },
        prepare({ title, products }) {
            return {
                title: title || 'Tutorials',
                subtitle: products ? `${products.length} ${products.length === 1 ? 'product' : 'products'}` : 'No products'
            }
        }
    }
}

