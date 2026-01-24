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
      title: 'title',
      profiles: 'profiles',
      firstProfile: 'profiles.0.title'
    },
    prepare({ title, profiles, firstProfile }) {
      const displayTitle = title || 'Featured Profiles'
      const subtitleParts = [
        profiles?.length > 0 && `${profiles.length} profile${profiles.length === 1 ? '' : 's'}`,
        firstProfile && `"${firstProfile}"`
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Featured Profiles',
        media: Article
      }
    }
  }
}
