import { LinkSimple } from 'phosphor-react'

export default {
  title: 'Link',
  name: 'link',
  type: 'object',
  icon: LinkSimple,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: 'Display Text',
      validation: Rule => Rule.required()
    },
    {
      title: 'Link Type',
      name: 'linkType',
      type: 'string',
      options: {
        list: [
          { title: 'External URL', value: 'navLink' },
          { title: 'Internal Page', value: 'navPage' },
          { title: 'Ask Julie', value: 'askJulie' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'navPage',
      validation: Rule => Rule.required()
    },
    {
      title: 'URL',
      name: 'url',
      type: 'url',
      description: 'Enter an external URL',
      hidden: ({ parent }) => !parent || parent.linkType !== 'navLink',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https', 'mailto', 'tel']
      }).custom((value, context) => {
        if (!context || !context.parent) {
          return true
        }
        
        const linkType = context.parent.linkType
        
        if (linkType === 'navLink' && !value) {
          return 'URL is required for external links'
        }
        
        return true
      })
    },
    {
      title: 'Page',
      name: 'page',
      type: 'reference',
      to: [
        { type: 'page' }, 
        { type: 'blog' }, 
        { type: 'article' },
        { type: 'profile' },
        { type: 'product' },
        { type: 'collection' },
        { type: 'home' },
      ],
      hidden: ({ parent }) => !parent || parent.linkType !== 'navPage',
      validation: Rule => Rule.custom((value, context) => {
        if (!context || !context.parent) {
          return true
        }
        
        const linkType = context.parent.linkType
        
        if (linkType === 'navPage' && !value) {
          return 'Page is required for internal page links'
        }
        
        return true
      })
    },
    {
      title: 'Anchor',
      name: 'anchor',
      type: 'string',
      description: 'Optional: Link to a specific section on the page. Enter the same anchor slug used on the target module.',
      hidden: ({ parent }) => !parent || parent.linkType !== 'navPage',
      validation: Rule => Rule.custom((value) => {
        if (!value) return true
        // Only allow lowercase letters, numbers, and hyphens
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Anchor must only contain lowercase letters, numbers, and hyphens (e.g., "my-section")'
        }
        return true
      }),
    },
  ],
  preview: {
    select: {
      title: 'title',
      linkType: 'linkType',
      url: 'url',
      pageSlug: 'page.slug.current',
      pageTitle: 'page.title',
      anchor: 'anchor'
    },
    prepare({ title, linkType, url, pageSlug, pageTitle, anchor }) {
      let subtitle = ''
      
      if (!linkType) {
        subtitle = 'No link type selected'
      } else if (linkType === 'askJulie') {
        subtitle = 'Ask Julie'
      } else if (linkType === 'navLink') {
        subtitle = url || 'No URL'
      } else if (linkType === 'navPage') {
        const pagePath = pageSlug ? `/${pageSlug}` : (pageTitle || 'No page selected')
        subtitle = anchor ? `${pagePath}#${anchor}` : pagePath
      }

      return {
        title: title || 'Untitled Link',
        subtitle: subtitle || 'No link configured',
        media: LinkSimple
      }
    }
  }
}
