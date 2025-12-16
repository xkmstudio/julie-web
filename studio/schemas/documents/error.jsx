import React from 'react'
import { List } from 'phosphor-react'


export default {
  title: 'Error',
  name: 'error',
  type: 'document',
  icon: () => <List />,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items'
    },
    prepare({ title = 'Untitled', items = [] }) {
      return {
        title,
        subtitle: `${items.length} link(s)`,
        media: List
      }
    }
  }
}
