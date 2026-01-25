import { ArrowsLeftRight } from 'phosphor-react'

export default {
  title: 'Carousel',
  name: 'carousel',
  type: 'object',
  icon: ArrowsLeftRight,
  fields: [
    {
      title: 'Images',
      name: 'images',
      type: 'array',
      of: [{ type: 'asset'}],
      description: 'Add at least 4 images for the carousel',
      validation: Rule => Rule.min(4).error('At least 4 images are required for the carousel'),
      preview: {
        select: {
          image: 'image',
          alt: 'alt'
        },
        prepare({ image, alt }) {
          const displayTitle = alt || image?.asset?.originalFilename || 'Image'
          
          return {
            title: displayTitle,
            media: image || ArrowsLeftRight
          }
        }
      }
    }
  ],
  preview: {
    select: {
      imagesCount: 'images.length',
      firstImage: 'images.0.image'
    },
    prepare({ imagesCount, firstImage }) {
      const displayTitle = 'Carousel'
      const subtitle = imagesCount > 0 
        ? `${imagesCount} image${imagesCount > 1 ? 's' : ''}`
        : 'No images'
      
      return {
        title: displayTitle,
        subtitle: subtitle,
        media: firstImage || ArrowsLeftRight
      }
    }
  }
}
