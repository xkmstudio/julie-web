import React from 'react'
import { Browser } from 'phosphor-react'


export default {
  title: 'Page',
  name: 'page',
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
      slugify: input =>
        input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 200)
    },
    {
      title: 'Padding',
      name: 'padding',
      type: 'string',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Top', value: 'top' },
          { title: 'Bottom', value: 'bottom' },
          { title: 'Both', value: 'both' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'standard'
    },
    {
      title: 'Page Modules',
      name: 'modules',
      type: 'array',
      of: [
        { type: 'hero' },
        { type: 'productFeature' },
        { type: 'marquee' },
        { type: 'textBlock' },
        { type: 'mediaFeature' },
        { type: 'mediaBleed' },
        { type: 'tutorials' },
        { type: 'drawer' },
        { type: 'indexList' },
        { type: 'indexTutorials' },
        { type: 'productContents' },
        { type: 'productRelated' },
        { type: 'slideshow' },
        { type: 'generalText' },
      ]
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
      description: 'Preview image for 3D menu. Can be auto-generated via webhook when page is published.',
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
