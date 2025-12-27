import { Sidebar } from 'phosphor-react'

export default {
  title: 'FAQs',
  name: 'faqs',
  type: 'object',
  icon: Sidebar,
  fields: [
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
      ]
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
                  ]
                }
              ]
            },

          ]
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
    },
    prepare({ title }) {
      return {
        title: title,
      }
    }
  }
}

