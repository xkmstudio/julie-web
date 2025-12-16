import React from 'react'
import { Browser } from 'phosphor-react'


export default {
  title: 'Tutorials',
  name: 'tutorialsPage',
  type: 'document',
  icon: () => <Browser />,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      title: 'URL Slug',
      name: 'slug',
      type: 'slug',
      description: '(required)',
      options: {
        source: 'title',
        maxLength: 96,
      },
      hidden: true,
      slugify: input =>
        input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 200)
    },
    {
      title: 'Description',
      name: 'description',
      type: 'simplePortableText',
    },
    {
      title: 'CTA',
      name: 'cta',
      type: 'array',
      of: [{ type: 'navPage' }, { type: 'navLink' }],
      validation: Rule => Rule.max(1)
    },
    {
      title: 'Video Tutorials',
      name: 'videoTutorials',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      validation: Rule => Rule.required().min(1)
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    },
    {
      title: 'Preview Image',
      name: 'previewImage',
      type: 'image',
      description: 'Preview image for 3D menu. Can be auto-generated via webhook when tutorials page is published.',
      options: {
        hotspot: true
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug'
    },
    prepare({ title = 'Untitled', slug = {} }) {
      const path = `/${slug.current}`
      return {
        title,
        subtitle: slug.current ? path : '(missing slug)'
      }
    }
  }
}
