import { Circle, Infinity } from 'phosphor-react'

import customImage from '../../lib/custom-image'

export default {
    title: 'Icons',
    name: 'marqueeIcons',
    type: 'object',
    icon: Infinity,
    fieldsets: [
        {
            title: '',
            name: 'options',
            options: { columns: 2 }
        }
    ],
    fields: [
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            // description: 'Internal use only'
        },
        {
            title: 'Use Marquee',
            name: 'marquee',
            type: 'boolean',
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
                    icon: Circle,
                    fields: [
                        {
                            title: 'Icon',
                            name: 'icon',
                            type: 'asset',
                            validation: Rule => Rule.required()
                        },
                        {
                            title: 'Link',
                            name: 'link',
                            type: 'url',
                            description: '(optional)'
                        }
                    ],
                    preview: {
                        select: {
                            iconAlt: 'icon.alt',
                            iconImage: 'icon.image',
                            link: 'link'
                        },
                        prepare({ iconAlt, iconImage, link }) {
                            const displayTitle = iconAlt || iconImage?.asset?.originalFilename || 'Icon'
                            const subtitle = link ? link : undefined
                            
                            return {
                                title: displayTitle,
                                subtitle: subtitle,
                                media: iconImage || Circle
                            }
                        }
                    }
                },
            ],
            validation: Rule => Rule.min(1).required()
        },
        {
            title: 'Speed',
            name: 'speed',
            type: 'number',
            description: 'Pick a number between 0-1 (0.5 is the default)',
            initialValue: 0.5,
            hidden: ({ parent }) => !parent.marquee,
            validation: Rule =>
                Rule.min(0)
                    .max(1)
                    .precision(1)
        },
        {
            title: 'Reverse direction?',
            name: 'reverse',
            type: 'boolean',
            initialValue: false,
            fieldset: 'options',
            hidden: ({ parent }) => !parent.marquee,
        },
        {
            title: 'Pause on hover?',
            name: 'pausable',
            type: 'boolean',
            initialValue: false,
            fieldset: 'options',
            hidden: ({ parent }) => !parent.marquee,
        },
    ],
    preview: {
        select: {
            title: 'title',
            firstIconImage: 'items.0.icon.image',
            itemsCount: 'items.length',
            useMarquee: 'marquee',
            speed: 'speed',
            reverse: 'reverse',
            pausable: 'pausable'
        },
        prepare({ title, firstIconImage, itemsCount, useMarquee, speed, reverse, pausable }) {
            const displayTitle = title || 'Icons Marquee'
            const subtitleParts = [
                itemsCount > 0 && `${itemsCount} icon${itemsCount > 1 ? 's' : ''}`,
                useMarquee ? 'Animated' : 'Static',
                useMarquee && speed && `Speed: ${speed}`,
                useMarquee && reverse && '← Reverse',
                useMarquee && pausable && 'Pause on hover'
            ].filter(Boolean)
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Icons',
                media: firstIconImage || Infinity
            }
        }
    }
}
