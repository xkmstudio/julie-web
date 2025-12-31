import { Star } from 'phosphor-react'

export default {
  title: 'Hero',
  name: 'hero',
  type: 'object',
  icon: Star,
  fields: [
    {
      title: 'Include Ema',
      name: 'hasEma',
      type: 'boolean',
      initialValue: true,
    },
    {
      title: 'Title',
      name: 'title',
      type: 'simplePortableText'
    },
    {
      title: 'Subtitle',
      name: 'subtitle',
      type: 'simplePortableText'
    },
    {
      title: 'Mobile Tag',
      name: 'mobileTag',
      type: 'string',
      description: 'This will be displayed on the mobile at the bottom and stretch the hero to the bottom of the screen',
    },
    {
      title: 'Background Media',
      name: 'backgroundMedia',
      type: 'media'
    },
  ],
  preview: {
    select: {
      title: 'title.0.children[0].text',
      subtitle: 'subtitle.0.children[0].text',
      mobileTag: 'mobileTag',
      backgroundMedia: 'backgroundMedia.media[0].image',
      hasEma: 'hasEma',
    },
    prepare({ title, subtitle, mobileTag, backgroundMedia, hasEma }) {
      return {
        title: title,
        subtitle: `${hasEma ? 'Includes Ema Chat' : 'Does not include Ema Chat'}`,
        media: backgroundMedia,
      }
    }
  }
}
