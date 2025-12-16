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
      title: 'Toolkit Product Variant ID',
      name: 'toolkitProductID',
      type: 'number',
      group: 'settings',
      description:
        'The variant ID of the optional toolkit product. If set, customers can add/remove the toolkit from their cart. Leave empty to disable the toolkit option.'
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
      title: 'Product Type',
      name: 'productType',
      type: 'string',
      description: 'e.g., Upper Garment, Lower Garment',
      group: 'content'
    },
    {
      title: 'Tutorial',
      name: 'tutorial',
      type: 'videoTutorial',
      description: 'Video tutorial for this product with sections',
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
      title: 'Sizing Chart',
      description: 'Structured sizing chart data for the product details drawer.',
      name: 'sizingChart',
      type: 'object',
      group: 'details',
      fields: [
        {
          title: 'Sizes',
          name: 'sizes',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  title: 'Size Label',
                  name: 'label',
                  type: 'string',
                  description: 'e.g., XS, S, M, L, XL',
                },
                {
                  title: 'Italian Size',
                  name: 'italianSize',
                  type: 'number',
                  description: 'e.g., 36, 38, 40, 42, 44',
                },
              ],
            },
          ],
        },
        {
          title: 'Measurements',
          name: 'measurements',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  title: 'Measurement Name',
                  name: 'name',
                  type: 'string',
                  description: 'e.g., CHEST, WAIST, LENGTH, SHOULDER',
                },
                {
                  title: 'Unit',
                  name: 'unit',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Centimeters', value: 'cm' },
                      { title: 'Inches', value: 'in' },
                    ],
                  },
                  initialValue: 'cm',
                },
                {
                  title: 'Values',
                  name: 'values',
                  type: 'array',
                  of: [{ type: 'number' }],
                  description: 'Values for each size in the same order as sizes array',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Product Detail Images',
      description: 'Images showing different views of the product (LEFT, FRONT, RIGHT, BACK)',
      name: 'detailImages',
      type: 'object',
      group: 'details',
      fields: [
        {
          title: 'Left View',
          name: 'left',
          type: 'asset',
        },
        {
          title: 'Front View',
          name: 'front',
          type: 'asset',
        },
        {
          title: 'Right View',
          name: 'right',
          type: 'asset',
        },
        {
          title: 'Back View',
          name: 'back',
          type: 'asset',
        },
      ],
    },
    {
      title: 'Materials Information',
      description: 'Materials details shown in the product details drawer.',
      name: 'materialsInfo',
      type: 'simplePortableText',
      group: 'details',
    },
    {
      title: 'Shipping Information',
      description: 'Shipping details shown in the product details drawer.',
      name: 'shippingInfo',
      type: 'simplePortableText',
      group: 'details',
    },
    {
      title: 'Returns Information',
      description: 'Returns policy details shown in the product details drawer.',
      name: 'returnsInfo',
      type: 'simplePortableText',
      group: 'details',
    },
    {
      title: 'Product Thumbnail',
      description:
        'This will be shown as the thumbnail for product cards.',
      name: 'productThumbnail',
      type: 'media',
      group: 'details',
    },
    {
      title: 'Product Galleries',
      name: 'productGalleries',
      type: 'array',
      of: [
        {
          title: 'Gallery',
          name: 'gallery',
          type: 'object',
          fields: [
            {
              title: 'Images',
              name: 'images',
              type: 'array',
              of: [{ type: 'asset' }],
              options: {
                layout: 'grid'
              }
            },
            {
              title: 'Associated Variants',
              name: 'variants',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'productVariant' }],
                  options: {
                    filter: ({ document }) => {
                      return {
                        filter: 'productID == $productID',
                        params: { productID: document?.productID }
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {
              image: 'images.0.image',
              variants: 'variants'
            },
            prepare({ image, variants }) {
              return {
                title: 'Product Gallery',
                media: image,
                subtitle: variants
                  ? `${variants.length} ${variants.length > 1 ? 'Variants' : 'Variant'
                  }`
                  : null
              }
            }
          }
        }
      ],
      description:
        'Define a Gallery for your product, or for a subset of variants',
      group: 'photos',
      hidden: ({ parent }) => parent?.limitedEdition
    },
    {
      title: 'Cart Images',
      name: 'cartImages',
      type: 'array',
      of: [
        {
          title: 'Images',
          name: 'images',
          type: 'object',
          fields: [
            {
              title: 'Image',
              name: 'image',
              type: 'asset'
            },
            {
              title: 'Associated Variants',
              name: 'variants',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'productVariant' }],
                  options: {
                    filter: ({ document }) => {
                      return {
                        filter: 'productID == $productID',
                        params: { productID: document?.productID }
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {
              image: 'image.image',
              variants: 'variants'
            },
            prepare({ image, variants }) {
              return {
                title: 'Cart Images',
                media: image,
                subtitle: variants
                  ? `${variants.length} ${variants.length > 1 ? 'Variants' : 'Variant'
                  }`
                  : null
              }
            }
          }
        }
      ],
      description:
        'Define a Gallery for your product, or for a subset of variants',
      group: 'photos'
    },
    {
      title: 'Product Swatches',
      name: 'productSwatches',
      type: 'array',
      of: [
        {
          title: 'Swatches',
          name: 'swatches',
          type: 'object',
          fields: [
            {
              title: 'Color',
              name: 'color',
              type: 'color',
              hidden: true
            },
            {
              title: 'Swatch',
              name: 'swatch',
              type: 'asset'
            },
            {
              title: 'Associated Variants',
              name: 'variants',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'productVariant' }],
                  options: {
                    filter: ({ document }) => {
                      return {
                        filter: 'productID == $productID',
                        params: { productID: document?.productID }
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {
              image: 'swatch.image',
              variants: 'variants'
            },
            prepare({ image, variants }) {
              return {
                title: 'Swatch',
                media: image
              }
            }
          }
        }
      ],
      description: 'Define swatches for individual variants',
      group: 'settings'
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
        { type: 'slideshow' },
        { type: 'textBlock' },
        { type: 'drawer' },
        { type: 'indexList' },
        { type: 'indexTutorials' },
        { type: 'mediaFeature' },
        { type: 'mediaBleed' },
        { type: 'tutorials' },
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
      title: 'Preview Image',
      name: 'previewImage',
      type: 'image',
      description: 'Preview image for 3D menu. Can be auto-generated via webhook when product is published.',
      options: {
        hotspot: true
      },
      hidden: true,
      group: 'settings'
    },
    {
      title: '3D Model (GLB/GLTF)',
      name: 'model3D',
      type: 'file',
      description: 'Upload a GLB or GLTF 3D model file. This will be displayed in an interactive 3D viewer on the product page.',
      options: {
        accept: '.glb,.gltf'
      },
      group: 'content'
    },
    {
      title: 'Background Media',
      name: 'backgroundMedia',
      type: 'media',
      description: 'Media which displays behind hero content.',
      group: 'content'
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
  initialValue: {
    useGallery: 'false',
    galleryPhotos: {
      _type: 'productGallery',
      forOption: ''
    },
    listingPhotos: {
      _type: 'productListingPhotos',
      forOption: ''
    },
    cartPhotos: {
      _type: 'productCartPhotos',
      forOption: ''
    }
  },
  preview: {
    select: {
      store: 'store',
      isDraft: 'isDraft',
      wasDeleted: 'wasDeleted',
      title: 'title',
      productTitle: 'productTitle',
      slug: 'slug',
      cartImages: 'cartImages',
      listingPhoto: 'listingPhoto',
      thumbnailFeature: 'thumbnailFeature.image',
      thumbnailSecondary: 'thumbnailSecondary.image'
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
