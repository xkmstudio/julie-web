import { Sidebar } from 'phosphor-react'

export default {
    title: 'Testimonials',
    name: 'testimonials',
    type: 'object',
    icon: Sidebar,
    fields: [
        {
            title: 'Testimonials',
            name: 'testimonials',
            type: 'array',
            of: [
                {
                    title: 'Testimonial',
                    name: 'testimonial',
                    type: 'object',
                    fields: [
                        {
                            title: 'Body',
                            name: 'content',
                            type: 'simplePortableText'
                        },
                        {
                            title: 'Name',
                            name: 'name',
                            type: 'string'
                        },
                    ]
                }
            ]
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

