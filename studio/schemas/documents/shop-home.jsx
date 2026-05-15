import React from 'react'
import { SquaresFour } from 'phosphor-react'

export default {
  title: 'Primary Shop',
  name: 'shopHome',
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
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{type: 'collection'}],
      validation: Rule => Rule.required(),
      description:
        'The shop entry in Sanity. The public site /collections URL permanently redirects to this collection so the store lives at a single canonical URL (e.g. /collections/your-slug).'
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo',
      group: 'settings'
    }
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug',
      imageFeature: 'sections.0.products.0.thumbnailFeature.image',
      imageSecondary: 'sections.0.products.0.thumbnailSecondary.image'
    },
    prepare({ title = 'Untitled', slug = {}, imageFeature, imageSecondary }) {
      const path = `/collections/${slug.current}`
      return {
        title,
        subtitle: slug.current ? path : '(missing slug)',
        media: imageFeature || imageSecondary
      }
    }
  }
}
