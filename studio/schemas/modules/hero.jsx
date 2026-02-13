import { Star } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Hero',
  name: 'hero',
  type: 'object',
  icon: Star,
  fields: [
    anchorSlugField,
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
    {
      title: 'Mobile Background Media',
      name: 'backgroundMediaMobile',
      type: 'media',
      description: 'This will be displayed on mobile if present.'
    },
    {
      title: 'Theme',
      name: 'theme',
      type: 'string',
      description: 'Controls the text color',
      options: {
        list: [
          { title: 'White', value: 'light' },
          { title: 'Black', value: 'dark' },
          { title: 'Pink', value: 'pink' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'light'
    },
  ],
  preview: {
    select: {
      title: 'title.0.children[0].text',
      subtitle: 'subtitle.0.children[0].text',
      mobileTag: 'mobileTag',
      backgroundImage: 'backgroundMedia.media[0].image',
      backgroundVideo: 'backgroundMedia.media[0].video.asset.url',
      hasEma: 'hasEma',
    },
    prepare({ title, subtitle, mobileTag, backgroundImage, backgroundVideo, hasEma }) {
      const displayTitle = title || 'Hero'
      const displaySubtitle = [
        subtitle && `"${subtitle}"`,
        mobileTag && `Mobile: ${mobileTag}`,
        hasEma ? '✓ Ema Chat' : 'No Ema Chat'
      ].filter(Boolean).join(' • ') || 'Hero Module'
      
      return {
        title: displayTitle,
        subtitle: displaySubtitle,
        media: backgroundVideo ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              src={backgroundVideo}
            />
          </div>
        ) : backgroundImage || Star,
      }
    }
  }
}
