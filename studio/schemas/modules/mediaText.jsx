import { Image } from 'phosphor-react'

export default {
    title: 'Media & Text',
    name: 'mediaText',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Configuration',
            name: 'config',
            type: 'string',
            options: {
              list: [
                { title: 'Image Left', value: 'imageLeft' },
                { title: 'Image Right', value: 'imageRight' },
              ],
              layout: 'radio',
              direction: 'horizontal',
            },
            initialValue: 'standard',
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
            image: 'media.media[0].image',
            video: 'media.media[0].video.asset.url'
        },
        prepare({ title, image, video }) {
            return {
                title: title,
                media: video ? (
                    <div style={{ width: '100%', height: '100%' }}>
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
                        ></video>
                    </div>
                ) : (
                    image
                )
            }
        }
    }
}

