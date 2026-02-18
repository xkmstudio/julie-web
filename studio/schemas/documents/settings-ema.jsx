import { ChatCircle } from 'phosphor-react'

export default {
  title: 'Ema Settings',
  name: 'emaSettings',
  type: 'document',
  icon: ChatCircle,
  fields: [
    {
      title: 'Suggestions',
      name: 'suggestions',
      type: 'array',
      description: 'List of suggested questions that will appear below the hero chat widget',
      of: [
        {
          type: 'string',
        },
      ],
    },
    {
      title: 'Chat Placeholder Text',
      name: 'chatPlaceholder',
      type: 'string',
      description: 'Placeholder text shown in all EMA widget input fields until the user starts typing',
      initialValue: 'How can Julie help?',
    },
    {
      title: 'Disclaimer',
      name: 'disclaimer',
      type: 'text',
      description: 'Disclaimer text that renders at the bottom of the hero chat input',
      rows: 3,
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Ema Settings',
      }
    },
  },
}

