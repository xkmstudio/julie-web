import { Article } from 'phosphor-react'

export default {
  title: 'Featured Profiles',
  name: 'featuredProfiles',
  type: 'object',
  icon: Article,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Profiles',
      name: 'profiles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'profile' }],
        }
      ],
      validation: Rule => Rule.required().min(1)
    },
  ],
  preview: {
    select: {
      articles: 'articles',
      useList: 'useList'
    },
    prepare({ articles, useList }) {
      return {
        title: 'Featured Articles',
        subtitle: `${articles?.length || 0} ${
          articles?.length === 1 ? 'Article' : 'Articles'
        } • ${useList ? 'List' : 'Carousel'}`,
        media: () => <Article />
      }
    }
  }
}
