import { MapPin } from 'phosphor-react'

export default {
  title: 'Store Locator',
  name: 'storeLocator',
  type: 'object',
  icon: MapPin,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'string'
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
