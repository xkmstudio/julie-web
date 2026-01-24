import { List } from 'phosphor-react'

export default {
  title: 'Index List',
  name: 'indexList',
  type: 'object',
  icon: List,
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
      const displayTitle = title || 'Index List'
      const subtitleParts = [
        subtitle && `"${subtitle}"`,
        content && `"${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
        hasCta && '✓ CTA'
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Index List',
        media: List
      }
    }
  }
}

