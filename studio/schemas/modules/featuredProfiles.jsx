import { Article } from 'phosphor-react'
import { anchorSlugField } from '../../lib/fields'

export default {
  title: 'Featured Profiles',
  name: 'featuredProfiles',
  type: 'object',
  icon: Article,
  fields: [
    anchorSlugField,
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
      firstProfile: 'profiles.0.title',
      firstProfileImage: 'profiles.0.image.image'
    },
    prepare({ title, profiles, firstProfile, firstProfileImage }) {
      const displayTitle = title || 'Featured Profiles'
      const subtitleParts = [
        profiles?.length > 0 && `${profiles.length} profile${profiles.length === 1 ? '' : 's'}`,
        firstProfile && `"${firstProfile}"`
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Featured Profiles',
        media: firstProfileImage || Article
      }
    }
  }
}
