// import '../../branding/skin.css?raw'

import {
    Header1,
    Header2,
    Header3,
    Header4,
    Button
    // Quote
  } from '../../components/block-renders'
  
  export default {
    title: 'Rich Text',
    name: 'articlePortableText',
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
            component: Header2
          },
          {
            title: 'H3',
            value: 'h3',
            component: Header3
          },
          // {
          //   title: 'H4',
          //   value: 'h4',
          //   component: Header4
          // }
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' }
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
                  to: [{ type: 'page' }],
                  validation: Rule =>
                    Rule.uri({
                      scheme: ['http', 'https', 'mailto', 'tel']
                    }),
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
                }
              ]
            }
          ]
        }
      },
      {
        title: 'Block Quote',
        name: 'blockQuote',
        type: 'object',
        fields: [
          {
            title: 'Quote',
            name: 'quote',
            type: 'complexPortableText'
          },
          {
            title: 'Credit',
            name: 'credit',
            type: 'string'
          },
          {
            title: 'Role',
            name: 'role',
            type: 'string'
          }
        ]
      },
      {
        title: 'Image',
        name: 'image',
        type: 'image',
        options: {
          hotspot: true
        },
        fields: [
          {
            title: 'Caption',
            name: 'caption',
            type: 'string'
          }
        ]
      },
      {
        title: 'Carousel',
        name: 'carousel',
        type: 'object',
        fields: [
          {
            title: 'Slides',
            name: 'slides',
            type: 'array',
            of: [
              {
                title: 'Slide',
                name: 'slide',
                type: 'asset'
              }
            ],
            validation: Rule => Rule.min(3),
            preview: {
              select: {
                caption: 'caption',
                image: 'slide.0.image.image'
              },
              prepare({ image }) {
                return {
                  title: 'Slides',
                  media: image
                }
              }
            }
          }
        ]
      },
      {
        title: 'YouTube Video',
        name: 'youtubeVideo',
        type: 'object',
        fields: [
          {
            title: 'YouTube URL',
            name: 'url',
            type: 'url',
            description: 'Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)',
            validation: Rule => Rule.required().uri({
              scheme: ['https'],
              allowRelative: false
            })
          },
          {
            title: 'Caption (Optional)',
            name: 'caption',
            type: 'string',
            description: 'Optional caption for the video'
          }
        ],
        preview: {
          select: {
            url: 'url',
            caption: 'caption'
          },
          prepare({ url, caption }) {
            return {
              title: caption || 'YouTube Video',
              subtitle: url,
            }
          }
        }
      }
    ]
  }
  