import { Bag } from 'phosphor-react'

export default {
    title: 'Shop Featured Product',
    name: 'productShop',
    type: 'object',
    icon: Bag,
    fields: [
        {
            title: 'Mobile Tag',
            name: 'mobileTag',
            type: 'string',
            description: 'This will be displayed on the mobile at the bottom and stretch the hero to the bottom of the screen',
        },
        {
            title: 'Product',
            name: 'product',
            type: 'reference',
            to: [{ type: 'product' }],
            description: 'The product to feature in this shop section',
            validation: Rule => Rule.required()
        },
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            description: 'Override the product title (optional)'
        },
        {
            title: 'Description',
            name: 'description',
            type: 'text',
            description: 'Product description or value proposition'
        },
        {
            title: 'Value Props',
            name: 'values',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Key selling points or features (e.g., "Free Shipping", "30-Day Returns")'
        },
        {
            title: 'Location Logos',
            name: 'logos',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            title: 'Logo',
                            name: 'asset',
                            type: 'asset',
                            validation: Rule => Rule.required()
                        },
                        {
                            title: 'URL',
                            name: 'url',
                            type: 'url',
                            description: 'Optional: External URL to link the logo to',
                            validation: Rule => Rule.uri({
                                scheme: ['http', 'https']
                            })
                        }
                    ],
                    preview: {
                        select: {
                            alt: 'asset.alt',
                            image: 'asset.image',
                            url: 'url'
                        },
                        prepare({ alt, image, url }) {
                            const displayTitle = alt || image?.asset?.originalFilename || 'Logo'
                            const subtitle = url ? url : undefined
                            
                            return {
                                title: displayTitle,
                                subtitle: subtitle,
                                media: image || Bag
                            }
                        }
                    }
                }
            ],
        },
        {
            title: 'Background Media',
            name: 'backgroundMedia',
            type: 'media',
            description: '(optional)'
        }
    ],
    preview: {
        select: {
            product: 'product.title',
            title: 'title',
            description: 'description',
            listingPhoto: 'product.listingPhoto',
            thumbnailFeature: 'product.thumbnailFeature.image',
            thumbnailSecondary: 'product.thumbnailSecondary.image',
            backgroundImage: 'backgroundMedia.media[0].image',
            backgroundVideo: 'backgroundMedia.media[0].video.asset.url',
            mobileTag: 'mobileTag',
            logosCount: 'logos.length'
        },
        prepare({ product, title, description, listingPhoto, thumbnailFeature, thumbnailSecondary, backgroundImage, backgroundVideo, mobileTag, logosCount }) {
            const displayTitle = title || product || 'Shop Featured Product'
            const subtitleParts = [
                product && `Product: ${product}`,
                description && `"${description.substring(0, 40)}${description.length > 40 ? '...' : ''}"`,
                mobileTag && `Mobile: ${mobileTag}`,
                logosCount > 0 && `${logosCount} logo${logosCount > 1 ? 's' : ''}`
            ].filter(Boolean)
            
            const media = backgroundVideo ? (
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
                        src={backgroundVideo}
                    />
                </div>
            ) : backgroundImage || listingPhoto || thumbnailFeature || thumbnailSecondary || Bag
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Shop Featured Product',
                media: media
            }
        }
    }
}
