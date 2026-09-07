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
        title: 'Table',
        name: 'contentTable',
        type: 'object',
        fields: [
          {
            title: 'Title',
            name: 'title',
            type: 'string',
            description: 'Optional heading shown above the table'
          },
          {
            title: 'Columns',
            name: 'columns',
            type: 'string',
            description: 'Number of columns per row. FAQ tables usually stay at 2.',
            options: {
              list: [
                { title: '2', value: '2' },
                { title: '3', value: '3' },
                { title: '4', value: '4' },
                { title: '5', value: '5' },
                { title: '6', value: '6' }
              ],
              layout: 'radio',
              direction: 'horizontal'
            },
            initialValue: '2'
          },
          {
            title: 'Column headers',
            name: 'hasHeader',
            type: 'boolean',
            description: 'Turn on to add a header for each column. Leave off for FAQ tables. If a comparison table currently uses the first row as labels, move that text into the header fields and delete the row.',
            initialValue: false
          },
          {
            title: 'Header — Column 1',
            name: 'headerLeft',
            type: 'string',
            hidden: ({ parent }) => !parent?.hasHeader,
            validation: Rule => Rule.custom((value, context) => {
              if (context.parent?.hasHeader && !value) return 'Add a header for column 1'
              return true
            })
          },
          {
            title: 'Header — Column 2',
            name: 'headerMiddle',
            type: 'string',
            description: 'Shown when the table has 3 or more columns',
            hidden: ({ parent }) => !parent?.hasHeader || Number(parent?.columns || 2) < 3
          },
          {
            title: 'Header — Column 2 or 3',
            name: 'headerRight',
            type: 'string',
            description: 'Column 2 on 2-column tables. Column 3 when the table has 3 or more columns.',
            hidden: ({ parent }) => !parent?.hasHeader,
            validation: Rule => Rule.custom((value, context) => {
              if (context.parent?.hasHeader && !value) return 'Add this column header'
              return true
            })
          },
          {
            title: 'Header — Column 4',
            name: 'headerCol4',
            type: 'string',
            hidden: ({ parent }) => !parent?.hasHeader || Number(parent?.columns || 2) < 4
          },
          {
            title: 'Header — Column 5',
            name: 'headerCol5',
            type: 'string',
            hidden: ({ parent }) => !parent?.hasHeader || Number(parent?.columns || 2) < 5
          },
          {
            title: 'Header — Column 6',
            name: 'headerCol6',
            type: 'string',
            hidden: ({ parent }) => !parent?.hasHeader || Number(parent?.columns || 2) < 6
          },
          {
            title: 'Bold columns',
            name: 'boldColumns',
            type: 'array',
            description: 'Optional. Bold an entire column. Two-column FAQ tables already emphasize column 1 unless you set this. Bold individual words inside a cell with the Bold button.',
            of: [{ type: 'string' }],
            options: {
              list: [
                { title: 'Column 1', value: '1' },
                { title: 'Column 2', value: '2' },
                { title: 'Column 3', value: '3' },
                { title: 'Column 4', value: '4' },
                { title: 'Column 5', value: '5' },
                { title: 'Column 6', value: '6' }
              ]
            }
          },
          {
            title: 'Rows',
            name: 'rows',
            type: 'array',
            description: '2-column tables use Column 1 and Column 3. Tables with 3 or more columns use Column 1, Column 2, Column 3, then the extra columns in order.',
            of: [
              {
                title: 'Row',
                name: 'row',
                type: 'object',
                fields: [
                  {
                    title: 'Bold row',
                    name: 'bold',
                    type: 'boolean',
                    description: 'Bold every cell in this row',
                    initialValue: false
                  },
                  {
                    title: 'Column 1',
                    name: 'left',
                    type: 'simplePortableText'
                  },
                  {
                    title: 'Column 2',
                    name: 'middle',
                    type: 'simplePortableText',
                    description: 'Only used when the table has 3 or more columns'
                  },
                  {
                    title: 'Column 3',
                    name: 'right',
                    type: 'simplePortableText',
                    description: 'Column 2 on 2-column tables. Column 3 when the table has 3 or more columns.'
                  },
                  {
                    title: 'Column 4',
                    name: 'col4',
                    type: 'simplePortableText'
                  },
                  {
                    title: 'Column 5',
                    name: 'col5',
                    type: 'simplePortableText'
                  },
                  {
                    title: 'Column 6',
                    name: 'col6',
                    type: 'simplePortableText'
                  }
                ],
                preview: {
                  select: {
                    left: 'left.0.children.0.text',
                    middle: 'middle.0.children.0.text',
                    right: 'right.0.children.0.text',
                    col4: 'col4.0.children.0.text',
                    bold: 'bold'
                  },
                  prepare({ left, middle, right, col4, bold }) {
                    const subtitleParts = [middle, right, col4].filter(Boolean)
                    return {
                      title: `${bold ? 'Bold · ' : ''}${left || 'Empty'}`,
                      subtitle: subtitleParts.join(' • ')
                    }
                  }
                }
              }
            ],
            validation: Rule => Rule.min(1)
          },
          {
            title: 'Footnote',
            name: 'footnote',
            type: 'simplePortableText',
            description: 'Optional small note shown below the table'
          }
        ],
        preview: {
          select: {
            title: 'title',
            rows: 'rows',
            columns: 'columns',
            hasHeader: 'hasHeader'
          },
          prepare({ title, rows, columns, hasHeader }) {
            const count = Array.isArray(rows) ? rows.length : 0
            const subtitleParts = [
              `${columns || 2} columns`,
              `${count} row${count === 1 ? '' : 's'}`,
              hasHeader ? 'Header row' : 'No header'
            ]
            return {
              title: title || 'Table',
              subtitle: subtitleParts.join(' · ')
            }
          }
        }
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
  