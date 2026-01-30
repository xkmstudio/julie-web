import '../../branding/skin.css?raw'

import { Button } from '../../components/block-renders'

export default {
  title: 'Portable Text',
  name: 'simplePortableText',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [{ title: 'Paragraph', value: 'normal' }],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' }
        ],
        annotations: [
          {
            title: 'Link',
            name: 'link',
            type: 'object',
            component: Button,
            fields: [
              {
                title: 'Link Type',
                name: 'linkType',
                type: 'string',
                options: {
                  list: [
                    { title: 'Internal Page', value: 'internal' },
                    { title: 'External URL', value: 'external' }
                  ]
                },
                initialValue: 'internal',
                validation: Rule => Rule.required()
              },
              {
                title: 'Internal Page',
                name: 'page',
                type: 'reference',
                to: [
                  { type: 'page' },
                  { type: 'article' },
                  { type: 'blog' },
                  { type: 'profile' },
                  { type: 'product' },
                  { type: 'collection' },
                  { type: 'home' }
                ],
                hidden: ({ parent }) => parent.linkType !== 'internal'
              },
              {
                title: 'External URL',
                name: 'url',
                type: 'url',
                validation: Rule =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel']
                  }),
                hidden: ({ parent }) => parent.linkType !== 'external'
              },
              {
                // Keep href for backward compatibility and auto-conversion of pasted links
                title: 'URL (Legacy)',
                name: 'href',
                type: 'url',
                validation: Rule =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel']
                  }),
                hidden: ({ parent }) => parent.linkType !== undefined
              }
            ]
          }
        ]
      }
    }
  ]
}
