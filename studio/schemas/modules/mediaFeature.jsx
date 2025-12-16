import { Image } from 'phosphor-react'

export default {
    title: 'Media Feature',
    name: 'mediaFeature',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Media',
            name: 'media',
            type: 'media'
        },
        {
            title: 'Mobile Sizing',
            name: 'sizeMobile',
            type: 'string',
            options: {
                list: [
                    { title: 'Intrinsic', value: 'intrinsic' },
                    { title: 'Portrait', value: 'portrait' },
                    { title: 'Square', value: 'square' },
                ],
                layout: 'radio',
                direction: 'horizontal'
            },
            initialValue: 'intrinsic'
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

