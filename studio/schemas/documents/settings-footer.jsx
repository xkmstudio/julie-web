import { AnchorSimple} from 'phosphor-react'


export default {
  title: 'Footer Settings',
  name: 'footerSettings',
  type: 'document',
  icon: AnchorSimple,
  fields: [
    {
      title: 'Disclaimer',
      name: 'disclaimer',
      type: 'simplePortableText',
    },
    {
      title: 'Menus',
      name: 'menus',
      type: 'array',
      of: [
        {
          title: 'menu',
          type: 'object',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string',
            },
            {
              title: 'Menu Items',
              name: 'items',
              type: 'array',
              of: [
                {type: 'link'}
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Newsletter',
      name: 'newsletter',
      type: 'object',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          title: 'Klaviyo List ID',
          name: 'klaviyoListID',
          type: 'string',
        }
      ]
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Footer Settings'
      }
    }
  }
}
