// import '../../branding/skin.css?raw'
import { HighlighterCircle } from 'phosphor-react'

import {
  Header2,
  Button
} from '../../components/block-renders'

import customImage from '../../lib/custom-image'

export default {
  title: 'Rich Text',
  name: 'complexPortableText',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        {
          title: 'H2',
          value: 'h2',
          blockEditor: {
            render: Header2
          }
        }
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
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
            // blockEditor: {
            //   render: Button
            // },
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
                ],
                hidden: ({ parent }) => parent.linkType !== 'internal'
              },
              {
                title: 'External URL',
                name: 'url',
                type: 'url',
                hidden: ({ parent }) => parent.linkType !== 'external',
                validation: Rule => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              },
              
            ]
          },
          {
            title: 'Highlight',
            name: 'highlight',
            type: 'object',
            icon: HighlighterCircle,
            fields: [
              {
                title: 'Highlight Text',
                name: 'highlight',
                type: 'boolean',
              }
            ]
          }
        ]
      }
    },
    customImage(),
  ]
}
