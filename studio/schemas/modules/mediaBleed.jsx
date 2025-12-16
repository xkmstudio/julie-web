import { Image } from 'phosphor-react'

export default {
    title: 'Media Bleed',
    name: 'mediaBleed',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Media',
            name: 'media',
            type: 'mediaBleedObject'
        },
        {
            title: 'Size',
            name: 'size',
            type: 'string',
            options: {
                list: [
                    { title: 'Full Bleed', value: 'bleed' },
                    { title: 'Intrinsic', value: 'intrinsic' },
                ]
            },
            initialValue: 'bleed'
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

