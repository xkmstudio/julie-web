import { Sidebar } from 'phosphor-react'

export default {
  title: 'Drawer',
  name: 'drawer',
  type: 'object',
  icon: Sidebar,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    }, 
    {
      title: 'Text Icon',
      name: 'icon',
      type: 'string'
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'array',
      of: [{type: 'navPage'}, {type: 'navLink'}],
      validation: Rule => Rule.max(1)
    },
    {
      title: 'Type',
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Condensed', value: 'condensed' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'standard'
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
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title,
      }
    }
  }
}

