import { Package } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Product Contents',
  name: 'productContents',
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
            }
          ],
          preview: {
            select: {
              title: 'title',
              image: 'media.media[0].image',
              video: 'media.media[0].video.asset.url',
              imageAlt: 'media.media[0].alt'
            },
            prepare({ title, image, video, imageAlt }) {
              const displayTitle = title || imageAlt || 'Content Item'
              
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
              ) : image || Package
              
              return {
                title: displayTitle,
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
      firstItemVideo: 'contents.0.media.media[0].video.asset.url'
    },
    prepare({ title, contentsCount, firstItemTitle, firstItemImage, firstItemVideo }) {
      const displayTitle = title || 'Product Contents'
      const subtitleParts = [
        contentsCount > 0 && `${contentsCount} item${contentsCount > 1 ? 's' : ''}`,
        firstItemTitle && `"${firstItemTitle}"`
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
        subtitle: subtitleParts.join(' • ') || 'Product Contents',
        media: mediaPreview
      }
    }
  }
}

