import React from 'react'
import { Tag } from 'phosphor-react'

export default {
  title: 'Tag',
  name: 'tag',
  type: 'document',
  icon: () => <Tag />,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title
      }
    }
  }
}
