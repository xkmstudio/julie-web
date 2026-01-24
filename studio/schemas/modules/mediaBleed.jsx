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
            image: 'media.media[0].image',
            video: 'media.media[0].video.asset.url',
            size: 'size'
        },
        prepare({ image, video, size }) {
            const displayTitle = 'Media Bleed'
            const subtitle = size === 'bleed' ? 'Full Bleed' : 'Intrinsic'
            
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

