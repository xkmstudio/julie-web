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
            description: 'Add customer testimonials or reviews',
            of: [
                {
                    title: 'Testimonial',
                    name: 'testimonial',
                    type: 'object',
                    fields: [
                        {
                            title: 'Body',
                            name: 'content',
                            type: 'simplePortableText',
                            validation: Rule => Rule.required()
                        },
                        {
                            title: 'Name',
                            name: 'name',
                            type: 'string',
                            description: 'Name of the person giving the testimonial'
                        },
                    ],
                    preview: {
                        select: {
                            name: 'name',
                            content: 'content.0.children[0].text'
                        },
                        prepare({ name, content }) {
                            const displayTitle = name || 'Testimonial'
                            const subtitle = content ? `"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"` : undefined
                            
                            return {
                                title: displayTitle,
                                subtitle: subtitle,
                                media: Sidebar
                            }
                        }
                    }
                }
            ],
            validation: Rule => Rule.min(1).error('At least one testimonial is required')
        },
    ],
    preview: {
        select: {
            testimonials: 'testimonials',
            firstTestimonial: 'testimonials.0.content.0.children[0].text',
            firstName: 'testimonials.0.name'
        },
        prepare({ testimonials, firstTestimonial, firstName }) {
            const testimonialsCount = testimonials?.length || 0
            const displayTitle = 'Testimonials'
            const subtitleParts = [
                testimonialsCount > 0 && `${testimonialsCount} testimonial${testimonialsCount > 1 ? 's' : ''}`,
                firstName && `by ${firstName}`,
                firstTestimonial && `"${firstTestimonial.substring(0, 40)}${firstTestimonial.length > 40 ? '...' : ''}"`
            ].filter(Boolean)
            
            return {
                title: displayTitle,
                subtitle: subtitleParts.join(' • ') || 'Testimonials',
                media: Sidebar
            }
        }
    }
}

