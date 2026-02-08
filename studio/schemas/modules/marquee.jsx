import { Circle, Infinity } from 'phosphor-react'

import customImage from '../../lib/custom-image'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Text Marquee',
  name: 'marquee',
  type: 'object',
  icon: Infinity,
  fieldsets: [
    {
      title: '',
      name: 'options',
      options: { columns: 2 }
    }
  ],
  fields: [
    anchorSlugField,
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: '(optional)'
    },
    {
      name: 'link',
      title: 'Link',
      type: 'reference',
      to: [{ type: 'page' }],
      description: '(optional)'
    },
    {
      name: 'icon',
      title: 'Icon Overlay',
      type: 'asset',
      description: '(optional)'
    },
    {
      title: 'Items',
      name: 'items',
      type: 'array',
      of: [
        {
          title: 'Text',
          name: 'simple',
          type: 'object',
          icon: Circle,
          fields: [
            {
              title: 'Text',
              name: 'text',
              type: 'string',
              validation: Rule => Rule.required()
            }
          ],
          preview: {
            select: {
              text: 'text'
            },
            prepare({ text }) {
              return {
                title: text
              }
            }
          }
        },
      ],
      validation: Rule => Rule.min(1).required()
    },
    {
      title: 'Speed',
      name: 'speed',
      type: 'number',
      description: 'Pick a number between 0-1 (0.5 is the default)',
      initialValue: 0.5,
      validation: Rule =>
        Rule.min(0)
          .max(1)
          .precision(1)
    },
    {
      title: 'Reverse direction?',
      name: 'reverse',
      type: 'boolean',
      initialValue: false,
      fieldset: 'options'
    },
    {
      title: 'Pause on hover?',
      name: 'pausable',
      type: 'boolean',
      initialValue: false,
      fieldset: 'options'
    },    
  ],
  preview: {
    select: {
      title: 'title',
      firstItem: 'items.0.text',
      itemsCount: 'items.length',
      hasLink: 'link',
      iconImage: 'icon.image',
      speed: 'speed',
      reverse: 'reverse',
      pausable: 'pausable'
    },
    prepare({ title, firstItem, itemsCount, hasLink, iconImage, speed, reverse, pausable }) {
      const displayTitle = title || 'Text Marquee'
      const subtitleParts = [
        itemsCount > 0 && `${itemsCount} item${itemsCount > 1 ? 's' : ''}`,
        firstItem && `"${firstItem}"`,
        speed && `Speed: ${speed}`,
        reverse && '← Reverse',
        pausable && 'Pause on hover',
        hasLink && '✓ Link',
        iconImage && '✓ Icon'
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Text Marquee',
        media: iconImage || Infinity
      }
    }
  }
}
