import { Package } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Product Construction',
  name: 'productConstruction',
  type: 'object',
  icon: Package,
  fields: [
    anchorSlugField,
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Contents',
      name: 'contents',
      type: 'array',
      of: [
        {
          title: 'Item',
          name: 'item',
          type: 'object',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string'
            },
            {
              title: 'Media',
              name: 'media',
              type: 'media'
            },
            {
              title: 'Pattern',
              name: 'pattern',
              type: 'asset'
            }
          ],
          preview: {
            select: {
              title: 'title',
              image: 'media.media[0].image',
              video: 'media.media[0].video.asset.url',
              imageAlt: 'media.media[0].alt',
              patternImage: 'pattern.image',
              patternAlt: 'pattern.alt'
            },
            prepare({ title, image, video, imageAlt, patternImage, patternAlt }) {
              const displayTitle = title || imageAlt || patternAlt || 'Construction Item'
              const hasPattern = patternImage ? '✓ Pattern' : undefined
              
              const mediaPreview = video ? (
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
                    src={video}
                  />
                </div>
              ) : image || patternImage || Package
              
              return {
                title: displayTitle,
                subtitle: hasPattern,
                media: mediaPreview
              }
            }
          }
        },
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      contentsCount: 'contents.length',
      firstItemTitle: 'contents.0.title',
      firstItemImage: 'contents.0.media.media[0].image',
      firstItemVideo: 'contents.0.media.media[0].video.asset.url',
      hasPattern: 'contents.0.pattern'
    },
    prepare({ title, contentsCount, firstItemTitle, firstItemImage, firstItemVideo, hasPattern }) {
      const displayTitle = title || 'Product Construction'
      const subtitleParts = [
        contentsCount > 0 && `${contentsCount} item${contentsCount > 1 ? 's' : ''}`,
        firstItemTitle && `"${firstItemTitle}"`,
        hasPattern && '✓ Pattern'
      ].filter(Boolean)
      
      const mediaPreview = firstItemVideo ? (
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
            src={firstItemVideo}
          />
        </div>
      ) : firstItemImage || Package
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Product Construction',
        media: mediaPreview
      }
    }
  }
}

