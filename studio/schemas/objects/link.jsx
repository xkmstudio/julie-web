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
      validation: Rule => Rule.custom((value, context) => {
        if (context.parent?.linkType === 'navLink' && !value) {
          return 'URL is required for external links'
        }
        if (value) {
          return Rule.uri({
            scheme: ['http', 'https', 'mailto', 'tel']
          }).validate(value)
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
        if (context.parent?.linkType === 'navPage' && !value) {
          return 'Page is required for internal page links'
        }
        return true
      })
    },
  ],
  preview: {
    select: {
      title: 'title',
      linkType: 'linkType',
      url: 'url',
      pageSlug: 'page.slug.current',
      pageTitle: 'page.title'
    },
    prepare({ title, linkType, url, pageSlug, pageTitle }) {
      let subtitle = ''
      
      if (!linkType) {
        subtitle = 'No link type selected'
      } else if (linkType === 'askJulie') {
        subtitle = 'Ask Julie'
      } else if (linkType === 'navLink') {
        subtitle = url || 'No URL'
      } else if (linkType === 'navPage') {
        subtitle = pageSlug ? `/${pageSlug}` : (pageTitle || 'No page selected')
      }

      return {
        title: title || 'Untitled Link',
        subtitle: subtitle || 'No link configured'
      }
    }
  }
}
