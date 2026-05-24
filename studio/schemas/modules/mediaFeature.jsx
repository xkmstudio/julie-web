import { Image } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
    title: 'Media Feature',
    name: 'mediaFeature',
    type: 'object',
    icon: Image,
    fields: [
        anchorSlugField,
        {
            title: 'Layout',
            name: 'layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Standard', value: 'standard' },
                    { title: 'Overlay', value: 'overlay' },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            initialValue: 'overlay',
        },
        {
            title: 'Media',
            name: 'media',
            type: 'media'
        },
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            description: '(Optional)',
        },
        {
            title: 'Link',
            name: 'link',
            type: 'array',
            description: '(Optional)',
            of: [{ type: 'link' }],
            validation: Rule => Rule.max(1)
        }
    ],
    preview: {
        select: {
            title: 'title',
            image: 'media.media[0].image',
            video: 'media.media[0].video.asset.url',
            hasLink: 'link.0'
        },
        prepare({ title, image, video, hasLink }) {
            const displayTitle = title || 'Media Feature'
            const subtitle = hasLink ? '✓ Has Link' : 'Media Feature'
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
                subtitle: subtitle,
                media: mediaPreview
            }
        }
    }
}

