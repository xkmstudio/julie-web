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
      type: 'string',
      description: 'Main heading for the store locator section'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'string',
      description: 'Supporting text or description (optional)'
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
    },
    prepare({ title, subtitle }) {
      const displayTitle = title || 'Store Locator'
      const displaySubtitle = subtitle ? `"${subtitle}"` : 'Store Locator'
      
      return {
        title: displayTitle,
        subtitle: displaySubtitle,
        media: MapPin
      }
    }
  }
}
