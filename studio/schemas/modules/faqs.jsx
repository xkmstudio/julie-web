import { Sidebar } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'FAQs',
  name: 'faqs',
  type: 'object',
  icon: Sidebar,
  fields: [
    anchorSlugField,
    {
      title: 'Hero',
      name: 'hero',
      type: 'object',
      fields: [
        {
          title: 'Include Ema',
          name: 'hasEma',
          type: 'boolean',
          initialValue: true,
        },
        {
          title: 'Title',
          name: 'title',
          type: 'simplePortableText'
        },
        {
          title: 'Subtitle',
          name: 'subtitle',
          type: 'simplePortableText'
        },
        {
          title: 'Mobile Tag',
          name: 'mobileTag',
          type: 'string',
          description: 'This will be displayed on the mobile at the bottom and stretch the hero to the bottom of the screen',
        },
      ],
    },
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'object',
      fields: [
        {
          title: 'Text',
          name: 'text',
          type: 'string'
        },
        {
          title: 'Link',
          name: 'link',
          type: 'link'
        }
      ],
      preview: {
        select: {
          text: 'text',
          linkTitle: 'link.title',
          linkUrl: 'link.url',
          linkPage: 'link.page.title'
        },
        prepare({ text, linkTitle, linkUrl, linkPage }) {
          const displayTitle = text || linkTitle || 'CTA'
          const subtitle = linkUrl || linkPage || undefined
          
          return {
            title: displayTitle,
            subtitle: subtitle,
            media: Sidebar
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
                        media: Sidebar
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
                media: Sidebar
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
      const displayTitle = title || 'FAQs'
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
        subtitle: subtitleParts.join(' • ') || 'FAQs',
        media: Sidebar
      }
    }
  }
}

