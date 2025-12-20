import { Image } from 'phosphor-react'

export default {
    title: 'Media 3 Up',
    name: 'media3Up',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Background',
            name: 'background',
            type: 'boolean',
            description: 'Includes gradient background',
            initialValue: true,
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
            description: '(Optional)',
        },
        {
            title: 'Items',
            name: 'items',
            type: 'array',
            of: [
                {
                    title: 'Item',
                    name: 'item',
                    type: 'object',
                    fields: [
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
                            description: '(Optional)',
                        },
                    ],
                },
            ],
            validation: Rule => Rule.min(3).max(3),
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

