import React from 'react'

export default {
  title: 'Text Block',
  name: 'textBlock',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'complexPortableText',
    },
    {
      name: 'padding',
      title: 'Padding',
      type: 'boolean',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: title,
        media: <span style={{ fontSize: '1.5rem' }}>🎱</span>,
      }
    },
  },
}
