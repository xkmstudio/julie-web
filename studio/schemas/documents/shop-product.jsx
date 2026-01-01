import React from 'react'
import { Gift, CloudArrowDown, ArrowsClockwise } from 'phosphor-react'

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  __experimental_actions: ['update', 'publish', 'delete'],
  groups: [
    { title: 'Content', name: 'content', default: true },
    { title: 'Details', name: 'details' },
    { title: 'Photos', name: 'photos' },
    { title: 'Settings', name: 'settings' },
    { title: 'Shopify Data', name: 'shopify', icon: CloudArrowDown }
  ],
  fieldsets: [
    {
      title: 'Data',
      name: '2up',
      options: { columns: 2 }
    },
    {
      title: 'Product Cards',
      name: 'cards',
      description:
        'Define how this product should appear on collection pages and the cart',
      options: { columns: 2 },
      hidden: true,
    }
  ],
  icon: () => <Gift />,
  fields: [
    {
      title: 'Product Type',
      name: 'productType',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Alternate', value: 'alternate' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'primary',
      description: 'This determines how the product is displayed in places like featured products and product cards'
    },
    {
      title: 'Pre-Order',
      name: 'preOrder',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description:
        'This will set the add to cart button as Pre-Order to notify the customer'
    },
    {
      title: 'Shipping Note',
      name: 'noteShipping',
      type: 'string',
      group: 'settings',
      initialValue: false,
      description:
        'Keep this as short as possible. This will be included in the cart under the product title.'
    },
    {
      title: 'Display Title',
      name: 'title',
      type: 'string',
      group: 'content'
    },
    {
      title: 'Display Subtitle',
      name: 'subtitle',
      type: 'string',
      description: 'This will be shown next to the price e.g. 12 Polygons, 18 pieces.',
      group: 'content'
    },
    {
      title: 'Primary Description',
      description: 'This description is shown on the PDP.',
      name: 'description',
      type: 'simplePortableText',
      group: 'content',
    },
    {
      title: 'Info Drawers',
      description: 'This description is shown on the PDP.',
      name: 'drawers',
      type: 'array',
      of: [
        {
          title: 'Drawer',
          name: 'drawer',
          type: 'object',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string',
            },
            {
              title: 'Content',
              name: 'content',
              type: 'simplePortableText',
            },
          ]
        }
      ],
      group: 'content',
    },
    {
      title: 'Additional Links',
      description: 'These links will display as buttons below the add to cart button',
      name: 'additionalLinks',
      type: 'array',
      of: [{ type: 'link' }],
      group: 'content',
    },
    {
      title: 'Icons',
      description: 'These icons will display below the product description',
      name: 'icons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              title: 'Icon',
              name: 'icon',
              type: 'asset',
              validation: Rule => Rule.required()
            },
            {
              title: 'Link',
              name: 'link',
              type: 'url',
              description: '(optional)'
            }
          ],
          preview: {
            select: {
              icon: 'icon.image',
              title: 'icon.alt',
              link: 'link'
            },
            prepare({ icon, link, title }) {
              return {
                title: title || 'Icon',
                media: icon
              }
            }
          },
        }
      ],
      
      group: 'content',
    },

    {
      title: 'Product Badge',
      description:
        'Icon that is overlaid on the product thumbnail.',
      name: 'productBadge',
      type: 'asset',
      group: 'details',
      hidden: true,
    },
    {
      title: 'Product Thumbnail',
      description:
        'This will be shown as the thumbnail for product cards.',
      name: 'productThumbnail',
      type: 'media',
      group: 'photos',
    },
    {
      title: 'Default Gallery Images',
      name: 'defaultGallery',
      type: 'array',
      of: [{ type: 'asset' }],
      description:
        'Default gallery images used when variants don\'t have their own gallery. If variants have galleries, those will be used instead.',
      group: 'photos',
      options: {
        layout: 'grid'
      }
    },
    {
      title: 'Featured Thumbnail',
      description:
        'This will only be displayed as a full bleed thumbnail when the product is featured.',
      name: 'thumbnailFeature',
      type: 'asset',
      fieldset: 'cards',
      group: 'photos'
    },
    {
      title: 'Page Content',
      name: 'contentModules',
      type: 'array',
      of: [
        { type: 'marquee' },
        { type: 'productConstruction' },
        { type: 'productContents' },
        { type: 'productRelated' },
        { type: 'productFaqs' },
        { type: 'testimonials' },
        { type: 'slideshow' },
        { type: 'textBlock' },
        { type: 'faqs' },
        { type: 'indexList' },
        { type: 'indexTutorials' },
        { type: 'mediaFeature' },
        { type: 'mediaBleed' },
      ],
      group: 'content'
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo',
      group: 'settings'
    },
    {
      title: 'Product Title',
      name: 'productTitle',
      type: 'string',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Product ID',
      name: 'productID',
      type: 'number',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Price (cents)',
      name: 'price',
      type: 'number',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Compare Price (cents)',
      name: 'comparePrice',
      type: 'number',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'In Stock?',
      name: 'inStock',
      type: 'boolean',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Low Stock?',
      name: 'lowStock',
      type: 'boolean',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'SKU',
      name: 'sku',
      type: 'string',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'URL Slug',
      name: 'slug',
      type: 'slug',
      readOnly: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Options',
      name: 'options',
      type: 'array',
      of: [{ type: 'productOption' }],
      readOnly: true,
      group: 'shopify'
    },
    {
      title: 'Draft Mode',
      name: 'isDraft',
      type: 'boolean',
      readOnly: true,
      hidden: true,
      fieldset: '2up',
      group: 'shopify'
    },
    {
      title: 'Deleted from Shopify?',
      name: 'wasDeleted',
      type: 'boolean',
      readOnly: true,
      hidden: true,
      fieldset: '2up',
      group: 'shopify'
    }
  ],
  initialValue: {},
  preview: {
    select: {
      store: 'store',
      isDraft: 'isDraft',
      wasDeleted: 'wasDeleted',
      title: 'title',
      productTitle: 'productTitle',
      slug: 'slug',
      thumbnailFeature: 'thumbnailFeature.image'
    },
    prepare({
      store,
      isDraft = false,
      wasDeleted = false,
      title,
      slug = {},
      cartPhotos,
      thumbnailFeature,
      thumbnailSecondary
    }) {
      const path = `/products/${slug.current ?? store.slug?.current}`
      return {
        title:
          (title ? title : store.title) +
          (wasDeleted ? ' (removed)' : '') +
          (isDraft ? ' (draft)' : ''),
        media: thumbnailFeature ? (
          thumbnailFeature
        ) : thumbnailSecondary ? (
          thumbnailSecondary
        ) : (
          <Gift />
        ),
        subtitle: path
      }
    }
  }
}
