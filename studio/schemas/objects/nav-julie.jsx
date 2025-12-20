import { LinkSimpleHorizontal } from 'phosphor-react'

import { getStaticRoute, getDynamicRoute } from '../../lib/helpers'

export default {
  title: 'Julie Content',
  name: 'navJulie',
  type: 'object',
  icon: LinkSimpleHorizontal,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: 'Display Text'
    },
    {
      title: 'Content Type',
      name: 'contentType',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'article' },
          { title: 'Profile', value: 'profile' },
          { title: 'Blog', value: 'blog' },
        ],
      },
      validation: Rule => Rule.required()
    },
    {
      title: 'Article',
      name: 'article',
      type: 'reference',
      to: [{ type: 'article' }],
      hidden: ({ parent }) => parent.contentType !== 'article'
    },
    {
      title: 'Profile',
      name: 'profile',
      type: 'reference',
      to: [{ type: 'profile' }],
      hidden: ({ parent }) => parent.contentType !== 'profile'
    },
    {
      title: 'Blog',
      name: 'blog',
      type: 'reference',
      to: [{ type: 'blog' }],
      hidden: ({ parent }) => parent.contentType !== 'blog'
    },
  ],
  preview: {
    select: {
      title: 'title',
      contentType: 'contentType',
      articleSlug: 'article.slug.current',
      profileSlug: 'profile.slug.current',
      blogSlug: 'blog.slug.current'
    },
    prepare({ title, contentType, articleSlug, profileSlug, blogSlug }) {
      let slug = ''
      if (contentType === 'article' && articleSlug) {
        slug = `/blog/${articleSlug}`
      } else if (contentType === 'profile' && profileSlug) {
        slug = `/profiles/${profileSlug}`
      } else if (contentType === 'blog' && blogSlug) {
        slug = `/blog/${blogSlug}`
      }

      return {
        title: title,
        subtitle: slug || `${contentType} (no slug)`
      }
    }
  }
}
