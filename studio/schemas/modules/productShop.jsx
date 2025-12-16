import { Bag } from 'phosphor-react'

export default {
    title: 'Shop Featured Product',
    name: 'productShop',
    type: 'object',
    icon: Bag,
    fields: [
        {
            title: 'Product',
            name: 'product',
            type: 'reference',
            to: [{ type: 'product' }],
        },
        {
            title: 'Title',
            name: 'title',
            type: 'string',
        },
        {
            title: 'Description',
            name: 'description',
            type: 'text',
        },
        {
            title: 'Value Props',
            name: 'values',
            type: 'array',
            of: [{ type: 'string' }],
        },
        {
            title: 'Location Logos',
            name: 'logos',
            type: 'array',
            of: [{ type: 'asset' }],
        }
    ],
    preview: {
        select: {
            product: 'product.title',
            listingPhoto: 'product.listingPhoto',
            thumbnailFeature: 'product.thumbnailFeature.image',
            thumbnailSecondary: 'product.thumbnailSecondary.image'
        },
        prepare({ product, listingPhoto, thumbnailFeature, thumbnailSecondary }) {
            return {
                title: product,
                subtitle: 'Shop Featured Product',
                media: listingPhoto || thumbnailFeature || thumbnailSecondary
            }
        }
    }
}
