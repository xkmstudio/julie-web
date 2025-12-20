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
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ]
}
