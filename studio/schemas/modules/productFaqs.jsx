import { Quotes } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
    title: 'Product FAQs',
    name: 'productFaqs',
    type: 'object',
    icon: Quotes,
    fields: [
        anchorSlugField,
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            description: '(Internal use only)'
        },
        {
            title: 'CTA',
            name: 'cta',
            type: 'object',
            fields: [
                {
                    title: 'Title',
                    name: 'title',
                    type: 'string',
                },
                {
                    title: 'Link',
                    name: 'link',
                    type: 'link',
                },
            ],
            preview: {
                select: {
                    title: 'title',
                    link: 'link'
                },
                prepare({ title, link }) {
                    const displayTitle = title || 'CTA'
                    const subtitle = link || undefined
                    
                    return {
                        title: displayTitle,
                        subtitle: subtitle,
                        media: Quotes
                    }
                }
            }
        },
        {
            title: 'Sections',
            name: 'sections',
            type: 'array',
            of: [
                {
                    title: 'Section',
                    name: 'section',
                    type: 'object',
                    fields: [
                        {
                            title: 'Title',
                            name: 'title',
                            type: 'string'
                        },
                        {
                            title: 'Drawers',
                            name: 'drawers',
                            type: 'array',
                            of: [
                                {
                                    title: 'Drawer',
                                    name: 'drawer',
                                    type: 'object',
                                    fields: [
                                        {
                                            title: 'Title',
                                            name: 'title',
                                            type: 'string'
                                        },
                                        {
                                            title: 'Body',
                                            name: 'content',
                                            type: 'simplePortableText'
                                        }
                                    ],
                                    preview: {
                                        select: {
                                            title: 'title',
                                            content: 'content.0.children[0].text'
                                        },
                                        prepare({ title, content }) {
                                            const displayTitle = title || 'Drawer'
                                            const subtitle = content ? `"${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"` : undefined
                                            
                                            return {
                                                title: displayTitle,
                                                subtitle: subtitle,
                                                media: Quotes
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            drawersCount: 'drawers.length'
                        },
                        prepare({ title, drawersCount }) {
                            const displayTitle = title || 'Section'
                            const subtitle = drawersCount > 0 ? `${drawersCount} drawer${drawersCount > 1 ? 's' : ''}` : undefined
                            
                            return {
                                title: displayTitle,
                                subtitle: subtitle,
                                media: Quotes
                            }
                        }
                    }
                }
            ]
        },
        {
            title: 'Background Gradient',
            name: 'backgroundGradient',
            type: 'gradient',
        },
    ],
    preview: {
        select: {
            title: 'title',
            sectionsCount: 'sections.length',
            firstSectionTitle: 'sections.0.title',
            firstDrawerTitle: 'sections.0.drawers.0.title',
            drawersCount: 'sections.0.drawers.length',
            hasCta: 'cta',
            hasGradient: 'backgroundGradient'
        },
        prepare({ title, sectionsCount, firstSectionTitle, firstDrawerTitle, drawersCount, hasCta, hasGradient }) {
            const displayTitle = title || 'Product FAQs'
            const subtitleParts = [
                sectionsCount > 0 && `${sectionsCount} section${sectionsCount > 1 ? 's' : ''}`,
                firstSectionTitle && `"${firstSectionTitle}"`,
                drawersCount > 0 && `${drawersCount} drawer${drawersCount > 1 ? 's' : ''}`,
                firstDrawerTitle && `"${firstDrawerTitle}"`,
                hasCta && '✓ CTA',
                hasGradient && '✓ Gradient'
            ].filter(Boolean)
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Product FAQs',
                media: Quotes
            }
        }
    }
}

