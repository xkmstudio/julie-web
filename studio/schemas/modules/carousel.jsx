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
      validation: Rule => Rule.min(4),
      preview: {
        select: {
          title: 'title',
          image: 'images.0.image'
        },
        prepare({ title, image }) {
          return {
            title: 'Images',
            media: image
          }
        }
      }
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Carousel'
      }
    }
  }
}
