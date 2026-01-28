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
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: Rule => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              }
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
