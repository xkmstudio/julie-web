import { Article } from 'phosphor-react'

export default {
  title: 'Text Block',
  name: 'textBlock',
  type: 'object',
  icon: Article,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'string'
    },
    {
      title: 'Body',
      name: 'content',
      type: 'complexPortableText'
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'array',
      of: [{type: 'link'}],
      validation: Rule => Rule.max(1)
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      content: 'content.0.children[0].text',
      hasCta: 'cta.0'
    },
    prepare({ title, subtitle, content, hasCta }) {
      const displayTitle = title || 'Text Block'
      const subtitleParts = [
        subtitle && `"${subtitle}"`,
        content && `"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        hasCta && '✓ CTA'
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Text Block',
        media: Article
      }
    }
  }
}
