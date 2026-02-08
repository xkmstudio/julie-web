import { List } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Index Tutorials',
  name: 'indexTutorials',
  type: 'object',
  icon: List,
  fields: [
    anchorSlugField,
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
      firstProductImage: 'products.0.productThumbnail.media[0].image',
      firstProductVideo: 'products.0.productThumbnail.media[0].video.asset.url',
      firstProductThumbnail: 'products.0.thumbnailFeature.image',
      firstProductGallery: 'products.0.defaultGallery.0.image',
      hasCta: 'cta.0'
    },
    prepare({ title, subtitle, products, firstProduct, firstProductImage, firstProductVideo, firstProductThumbnail, firstProductGallery, hasCta }) {
      const displayTitle = title || 'Index Tutorials'
      const productsCount = products?.length || 0
      const subtitleParts = [
        subtitle && `"${subtitle}"`,
        productsCount > 0 && `${productsCount} product${productsCount === 1 ? '' : 's'}`,
        firstProduct && `"${firstProduct}"`,
        hasCta && '✓ CTA'
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
      ) : firstProductImage || firstProductThumbnail || firstProductGallery || List
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Index Tutorials',
        media: mediaPreview
      }
    }
  }
}

