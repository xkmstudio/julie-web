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
      type: 'string',
      description: 'Section title (optional)'
    },
    {
      title: 'Media',
      name: 'media',
      type: 'media',
      description: 'Background or featured media for this section'
    },
    {
      title: 'Product',
      name: 'product',
      type: 'reference',
      to: [{ type: 'product' }],
      description: 'The related product to display',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      product: 'product.title',
      productImage: 'product.listingPhoto',
      mediaImage: 'media.media[0].image',
      mediaVideo: 'media.media[0].video.asset.url'
    },
    prepare({ title, product, productImage, mediaImage, mediaVideo }) {
      const displayTitle = title || 'Product Related'
      const subtitleParts = [
        product && `Product: ${product}`
      ].filter(Boolean)
      
      const mediaPreview = mediaVideo ? (
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
            src={mediaVideo}
          />
        </div>
      ) : mediaImage || productImage || ShoppingBag
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Product Related',
        media: mediaPreview
      }
    }
  }
}

