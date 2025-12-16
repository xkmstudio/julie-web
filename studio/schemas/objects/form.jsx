import { CheckCircle } from 'phosphor-react'

export default {
  title: 'Form',
  name: 'form',
  type: 'object',
  fields: [
    {
      title: 'Formspark ID',
      name: 'formId',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      title: 'Fields',
      name: 'fields',
      type: 'array',
      of: [
        {
          title: 'String (Singe-line Text)',
          name: 'fieldString',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            }
          ]

        },
        {
          title: 'Email',
          name: 'fieldEmail',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            }
          ]

        },
        {
          title: 'Text Block (Multi-line Text)',
          name: 'fieldText',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            }
          ]
        },
        {
          title: 'List',
          name: 'fieldList',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            },
            {
              title: 'Options',
              name: 'options',
              type: 'array',
              of: [{ type: 'string' }]
            }
          ]
        },
        {
          title: 'Number',
          name: 'fieldNumber',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            }
          ]
        },
        {
          title: 'File',
          name: 'fieldFile',
          type: 'object',
          icon: CheckCircle,
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      title: 'Success',
      name: 'success',
      type: 'string'
    }
  ],
  preview: {
    select: {
      title: 'title'
    }
  }
}
