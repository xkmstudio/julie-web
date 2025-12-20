import React from 'react'
import { SquaresFour } from 'phosphor-react'

export default {
  title: 'Collection',
  name: 'collection',
  type: 'document',
  icon: () => <SquaresFour />,
  groups: [
    { title: 'Content', name: 'content', default: true },
    { title: 'Settings', name: 'settings' }
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'settings'
    },
    {
      title: 'URL Slug',
      name: 'slug',
      type: 'slug',
      description: '(required)',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required(),
      group: 'settings'
    },
    {
      title: 'Hero Media',
      name: 'hero',
      type: 'media',
      group: 'content'
    },
    {
      title: 'Products',
      name: 'products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      validation: Rule => Rule.required().min(1),
      group: 'content'
    },
    {
      title: 'Page Content',
      name: 'contentModules',
      type: 'array',
      of: [
        { type: 'hero' },
        { type: 'marquee' },
        { type: 'marqueeIcons' },
        { type: 'productCollection' },
        { type: 'slideshow' },
        { type: 'textBlock' },
        { type: 'drawer' },
        { type: 'mediaFeature' },
        { type: 'mediaBleed' },
        { type: 'productFeature' },
        { type: 'productShop' },
      ],
      group: 'content'
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo',
      group: 'settings'
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug',
      imageFeature: 'sections.0.products.0.thumbnailFeature.image',
      imageSecondary: 'sections.0.products.0.thumbnailSecondary.image'
    },
    prepare({ title = 'Untitled', slug = {}, imageFeature, imageSecondary }) {
      const path = `/shop/${slug.current}`
      return {
        title,
        subtitle: slug.current ? path : '(missing slug)',
        media: imageFeature || imageSecondary
      }
    }
  }
}
