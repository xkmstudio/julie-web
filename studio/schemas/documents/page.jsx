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
      initialValue: 'none',
      // hidden: true,
    },
    {
      title: 'Page Modules',
      name: 'modules',
      type: 'array',
      of: [
        { type: 'hero' },
        { type: 'productFeature' },
        { type: 'productShop' },
        { type: 'marquee' },
        { type: 'marqueeIcons' },
        { type: 'textBlock' },
        { type: 'mediaFeature' },
        { type: 'mediaText' },
        { type: 'media3Up' },
        { type: 'faqs' },
        { type: 'storeLocator' },
        { type: 'productContents' },
        { type: 'productRelated' },
        { type: 'slideshow' },
        { type: 'generalText' },
        { type: 'featuredArticles' },
        { type: 'featuredProfiles' },
      ]
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug'
    },
    prepare({ title = 'Untitled', slug = {} }) {
      const path = `/pages/${slug.current}`
      return {
        title,
        subtitle: slug.current ? path : '(missing slug)'
      }
    }
  }
}
