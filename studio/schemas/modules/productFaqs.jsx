import { Quotes } from 'phosphor-react'

export default {
    title: 'Product FAQs',
    name: 'productFaqs',
    type: 'object',
    icon: Quotes,
    fields: [
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
                    description: '(Internal use only)'
                },
                {
                    title: 'Link',
                    name: 'link',
                    type: 'url',
                },
            ]
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
                                    ]
                                }
                            ]
                        },
                        
                    ]
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
        },
        prepare({ title }) {
            return {
                title: title,
            }
        }
    }
}

