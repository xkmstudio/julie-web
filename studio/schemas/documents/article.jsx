import React from 'react'
import { Article } from 'phosphor-react'

export default {
  title: 'Article',
  name: 'article',
  type: 'document',
  icon: () => <Article />,
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
      name: 'useGradient',
      title: 'Use Gradient',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'gradient',
      title: 'Gradient',
      type: 'asset',
      hidden: ({ parent }) => !parent.useGradient,
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'asset',
      hidden: ({ parent }) => parent.useGradient,
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date'
    },

    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      validation: Rule => Rule.required()
    },
    {
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'profile' }] }],
      validation: Rule => Rule.required()
    },
    {
      name: 'reviewers',
      title: 'Reviewers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'profile' }] }],
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'simplePortableText',
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'simplePortableText',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'articlePortableText'
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
        { type: 'faqs' },
        { type: 'indexList' },
        { type: 'indexTutorials' },
        { type: 'productContents' },
        { type: 'productRelated' },
        { type: 'slideshow' },
        { type: 'generalText' },
        { type: 'media3Up' },
        { type: 'featuredArticles' },
      ]
    },
    {
      name: 'related',
      title: 'Related',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: Rule => Rule.max(3),
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ],
  preview: {
    select: {
      title: 'title',
      image: 'image.image'
    },
    prepare({ title, image }) {
      return {
        title: title,
        media: image
      }
    }
  }
}
