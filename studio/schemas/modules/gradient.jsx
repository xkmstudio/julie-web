import { Gradient } from 'phosphor-react'

export default {
  title: 'Gradient',
  name: 'gradient',
  type: 'object',
  icon: Gradient,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: '(Internal use only)',
      hidden: true
    },
    {
      title: 'Gradient Type',
      name: 'type',
      type: 'string',
      hidden: true,
      options: {
        list: [
          { title: 'Linear', value: 'linear' },
          { title: 'Radial', value: 'radial' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'linear'
    },
    {
      title: 'Direction',
      name: 'direction',
      type: 'string',
      description: 'Gradient direction (e.g., "to right", "to bottom", "45deg")',
      options: {
        list: [
          { title: 'To Top', value: 'to top' },
          { title: 'To Right', value: 'to right' },
          { title: 'To Bottom', value: 'to bottom' },
          { title: 'To Left', value: 'to left' },
          { title: 'To Top Right', value: 'to top right' },
          { title: 'To Top Left', value: 'to top left' },
          { title: 'To Bottom Right', value: 'to bottom right' },
          { title: 'To Bottom Left', value: 'to bottom left' },
        ],
      },
      initialValue: 'to bottom',
      hidden: true
    },
    {
      title: 'Custom Angle',
      name: 'customAngle',
      type: 'string',
      description: 'Custom angle in degrees (e.g., "45deg", "90deg"). Leave empty to use direction above.',
      hidden: true,
    },
    {
      title: 'Color Stops',
      name: 'colorStops',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Color Stop',
          fields: [
            {
              title: 'Color',
              name: 'color',
              type: 'color',
              options: {
                disableAlpha: false,
              },
            },
            {
              title: 'Position',
              name: 'position',
              type: 'number',
              description: 'Position percentage (0-100)',
              validation: Rule => Rule.min(0).max(100).required(),
              initialValue: 0,
            },
          ],
          preview: {
            select: {
              color: 'color.hex',
              position: 'position',
            },
            prepare({ color, position }) {
              return {
                title: `${color || 'No color'} at ${position || 0}%`,
                media: color ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: color,
                    }}
                  />
                ) : null,
              }
            },
          },
        },
      ],
      validation: Rule => Rule.min(2).max(10),
    },
    {
      title: 'Height',
      name: 'height',
      type: 'string',
      description: 'Section height (e.g., "100vh", "500px", "auto")',
      initialValue: '100vh',
      hidden: true,
    },
    {
      title: 'Padding',
      name: 'padding',
      type: 'string',
      description: 'Section padding (e.g., "60px", "30px 60px")',
      hidden: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      colorStops: 'colorStops',
    },
    prepare({ title, type, colorStops }) {
      const colors = colorStops?.map(stop => stop?.color?.hex).filter(Boolean).join(', ') || 'No colors'
      return {
        title: title || 'Gradient',
        subtitle: `${type || 'linear'} gradient - ${colors}`,
      }
    },
  },
}
