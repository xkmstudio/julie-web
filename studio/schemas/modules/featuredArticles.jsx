import { Article } from 'phosphor-react'

export default {
  title: 'Featured Articles',
  name: 'featuredArticles',
  type: 'object',
  icon: Article,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Articles',
      name: 'articles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        }
      ],
      validation: Rule => Rule.required().min(1)
    },
    {
      title: 'Use List',
      name: 'useList',
      type: 'boolean',
      description: 'If true, displays articles in a list format with gradient. If false, displays as a carousel.',
      initialValue: false,
    },
    {
      title: 'Featured Card',
      name: 'featuredCard',
      type: 'object',
      fields: [
        {
          title: 'Logo',
          name: 'logo',
          type: 'asset',  
        },
        {
          title: 'Media',
          name: 'media',
          type: 'media',  
        },
        {
          title: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          title: 'Description',
          name: 'description',
          type: 'simplePortableText',
        },
        {
          title: 'Subtitle',
          name: 'subtitle',
          type: 'simplePortableText',
        },
        {
          title: 'Link',
          name: 'link',
          type: 'url',
        },
      ],
      description: '(Optional) Displays next to the article list.',
      hidden: ({ parent }) => !parent.useList,
    }
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
