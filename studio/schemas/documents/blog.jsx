import React from 'react'
import { Notebook } from 'phosphor-react'

export default {
  title: 'Blog',
  name: 'blog',
  type: 'document',
  icon: () => <Notebook />,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      hidden: true,
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      title: 'Articles',
      name: 'articles',
      type: 'array',
      description: 'Control which articles appear on the blog index page and their order',
      of: [{ type: 'reference', to: [{ type: 'article' }] }]
    },
    {
      title: 'Editorial Standards',
      name: 'editorialStandards',
      type: 'simplePortableText',
      description: 'This content will appear at the bottom of all individual article pages'
    },
    {
      title: 'Global CTA',
      name: 'globalCta',
      type: 'object',
      description: 'This CTA will appear at the bottom of all individual article pages',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          title: 'Link',
          name: 'link',
          type: 'link',
          validation: Rule => Rule.required()
        }
      ]
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ]
}
