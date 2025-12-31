import { WarningCircle, Compass, Circle } from 'phosphor-react'

export default {
  title: 'Header Settings',
  name: 'headerSettings',
  type: 'document',
  icon: Compass,
  // __experimental_actions: ['update', 'publish'], // disable for initial publish
  fields: [
    {
      name: 'nav',
      title: 'Navigation',
      type: 'array',
      of: [{ type: 'link' }]
    },
    {
      name: 'navSecondary',
      title: 'Secondary Navigation',
      type: 'array',
      of: [{ type: 'link' }]
    },
    {
      name: 'enableBanner',
      title: 'Enable Banner',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'banner',
      title: 'Banner',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Text',
          type: 'string'
        },
        {
          name: 'link',
          title: 'Link',
          type: 'url',
          description: '(Optional)'
        },
      ],
      hidden: ({ parent }) => !parent.enableBanner
    },
  ],
  preview: {
    select: {
      date: 'date',
    },
    prepare({ date, image }) {
      return {
        title: 'Header Settings',
        subtitle: date
      }
    }
  }
}
