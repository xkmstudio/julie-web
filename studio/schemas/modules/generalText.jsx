import { Article } from 'phosphor-react'

export default {
  title: 'General Text',
  name: 'generalText',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      content: 'content.0.children[0].text',
    },
    prepare({ title, subtitle, content }) {
      const displayTitle = title || 'General Text'
      const subtitleParts = [
        subtitle && `"${subtitle}"`,
        content && `"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'General Text',
        media: Article
      }
    }
  }
}
