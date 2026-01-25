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
      firstProductImage: 'products.0.productThumbnail.media[0].image',
      firstProductVideo: 'products.0.productThumbnail.media[0].video.asset.url',
      firstProductThumbnail: 'products.0.thumbnailFeature.image',
      firstProductGallery: 'products.0.defaultGallery.0.image'
    },
    prepare({ products, firstProduct, firstProductImage, firstProductVideo, firstProductThumbnail, firstProductGallery }) {
      const productsCount = products?.length || 0
      const displayTitle = 'Featured Products'
      const subtitleParts = [
        productsCount > 0 && `${productsCount} product${productsCount > 1 ? 's' : ''}`,
        firstProduct && `"${firstProduct}"`
      ].filter(Boolean)
      
      // Priority: productThumbnail video > productThumbnail image > thumbnailFeature > defaultGallery > icon
      const mediaPreview = firstProductVideo ? (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            src={firstProductVideo}
          />
        </div>
      ) : firstProductImage || firstProductThumbnail || firstProductGallery || Bag
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Featured Products',
        media: mediaPreview
      }
    }
  }
}
