import { Presentation } from 'phosphor-react'

export default {
  title: 'Slideshow',
  name: 'slideshow',
  type: 'object',
  icon: Presentation,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: 'Section title (optional, for internal reference)'
    },
    {
      title: 'Slides',
      name: 'slides',
      type: 'array',
      description: 'Add images or videos to create a slideshow',
      of: [
        {
          title: 'Slide',
          name: 'slide',
          type: 'object',
          fields: [
            {
              title: 'Media',
              name: 'media',
              type: 'media'
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string'
            },
          ],
          preview: {
            select: {
              caption: 'caption',
              image: 'media.media[0].image',
              video: 'media.media[0].video.asset.url',
              imageAlt: 'media.media[0].alt'
            },
            prepare({ caption, image, video, imageAlt }) {
              const displayTitle = caption || imageAlt || 'Slide'
              
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
              ) : image || Presentation
              
              return {
                title: displayTitle,
                media: mediaPreview
              }
            }
          }
        }
      ]
    }

  ],
  preview: {
    select: {
      title: 'title',
      slidesCount: 'slides.length',
      firstSlideImage: 'slides.0.media.media[0].image',
      firstSlideVideo: 'slides.0.media.media[0].video.asset.url',
      firstSlideCaption: 'slides.0.caption'
    },
    prepare({ title, slidesCount, firstSlideImage, firstSlideVideo, firstSlideCaption }) {
      const displayTitle = title || 'Slideshow'
      const subtitleParts = [
        slidesCount > 0 && `${slidesCount} slide${slidesCount > 1 ? 's' : ''}`,
        firstSlideCaption && `"${firstSlideCaption}"`
      ].filter(Boolean)
      
      const mediaPreview = firstSlideVideo ? (
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
            src={firstSlideVideo}
          />
        </div>
      ) : firstSlideImage || Presentation
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Slideshow',
        media: mediaPreview
      }
    }
  }
}

