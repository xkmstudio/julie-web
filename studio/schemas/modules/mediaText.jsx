import { Image } from 'phosphor-react'

export default {
    title: 'Media & Text',
    name: 'mediaText',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Layout',
            name: 'config',
            type: 'string',
            description: 'Choose the media position relative to text',
            options: {
              list: [
                { title: 'Image Left', value: 'imageLeft' },
                { title: 'Image Right', value: 'imageRight' },
              ],
              layout: 'radio',
              direction: 'horizontal',
            },
            initialValue: 'imageRight',
          },
        {
            title: 'Media',
            name: 'media',
            type: 'media',
        },
        {
            title: 'Title',
            name: 'title',
            type: 'string',
        },
        {
            title: 'Subtitle',
            name: 'subtitle',
            type: 'string',
        },
        {
            title: 'Body',
            name: 'content',
            type: 'complexPortableText',
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
            image: 'media.media[0].image',
            video: 'media.media[0].video.asset.url',
            config: 'config',
            hasCta: 'cta.0'
        },
        prepare({ title, subtitle, image, video, config, hasCta }) {
            const displayTitle = title || 'Media & Text'
            const subtitleParts = [
                subtitle && `"${subtitle}"`,
                config && `Image ${config === 'imageLeft' ? 'Left' : 'Right'}`,
                hasCta && '✓ CTA'
            ].filter(Boolean)
            
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
            ) : image || Image
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Media & Text',
                media: mediaPreview
            }
        }
    }
}

