import { Image } from 'phosphor-react'

export default {
    title: 'Media 3 Up',
    name: 'media3Up',
    type: 'object',
    icon: Image,
    fields: [
        {
            title: 'Gradient Background',
            name: 'background',
            type: 'boolean',
            description: 'Enable gradient background behind the media items',
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
                    preview: {
                        select: {
                            title: 'title',
                            subtitle: 'subtitle',
                            image: 'media.media[0].image',
                            video: 'media.media[0].video.asset.url',
                            imageAlt: 'media.media[0].alt'
                        },
                        prepare({ title, subtitle, image, video, imageAlt }) {
                            const displayTitle = title || imageAlt || 'Media Item'
                            const displaySubtitle = subtitle || undefined
                            
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
                                subtitle: displaySubtitle,
                                media: mediaPreview
                            }
                        }
                    }
                },
            ],
            validation: Rule => Rule.min(3).max(3).error('Exactly 3 items are required for this layout'),
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'subtitle',
            firstItemImage: 'items.0.media.media[0].image',
            firstItemVideo: 'items.0.media.media[0].video.asset.url',
            firstItemTitle: 'items.0.title',
            itemsCount: 'items.length',
            hasBackground: 'background'
        },
        prepare({ title, subtitle, firstItemImage, firstItemVideo, firstItemTitle, itemsCount, hasBackground }) {
            const displayTitle = title || 'Media 3 Up'
            const subtitleParts = [
                itemsCount === 3 ? '3 items' : `${itemsCount || 0} items`,
                firstItemTitle && `"${firstItemTitle}"`,
                subtitle && `"${subtitle}"`,
                hasBackground && '✓ Gradient'
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
            ) : firstItemImage || Image
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Media 3 Up',
                media: mediaPreview
            }
        }
    }
}

