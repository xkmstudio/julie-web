import React from 'react'
import { SmileyBlank } from 'phosphor-react'

export default {
  title: 'Profile',
  name: 'profile',
  type: 'document',
  icon: () => <SmileyBlank />,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },   
    {
      name: 'image',
      title: 'Image',
      type: 'asset',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'simplePortableText',
    },
    {
        name: 'seo',
        title: 'SEO',
        type: 'seo',
    }
  ],
  preview: {
    select: {
      title: 'title',
      image: 'image.image',
      role: 'role',
    },
    prepare({ title, image, role }) {
      return {
        title: title,
        media: image,
        subtitle: role
      }
    }
  }
}
