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
      preview: {
        select: {
          title: 'title',
          subtitle: 'subtitle',
          description: 'description.0.children[0].text',
          link: 'link',
          image: 'media.media[0].image',
          video: 'media.media[0].video.asset.url',
          logo: 'logo.image',
          logoAlt: 'logo.alt'
        },
        prepare({ title, subtitle, description, link, image, video, logo, logoAlt }) {
          const displayTitle = title || logoAlt || 'Featured Card'
          const subtitleParts = [
            subtitle && subtitle.0?.children?.[0]?.text,
            description && `"${description.substring(0, 30)}${description.length > 30 ? '...' : ''}"`,
            link && link
          ].filter(Boolean)
          
          const mediaPreview = video ? (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                src={video}
              />
            </div>
          ) : image || logo || Article
          
          return {
            title: displayTitle,
            subtitle: subtitleParts.join(' • ') || undefined,
            media: mediaPreview
          }
        }
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      articles: 'articles',
      firstArticle: 'articles.0.title',
      useList: 'useList',
      cardImage: 'featuredCard.media.media[0].image',
      cardVideo: 'featuredCard.media.media[0].video.asset.url',
      cardTitle: 'featuredCard.title',
      hasCard: 'featuredCard'
    },
    prepare({ title, articles, firstArticle, useList, cardImage, cardVideo, cardTitle, hasCard }) {
      const displayTitle = title || 'Featured Articles'
      const articlesCount = articles?.length || 0
      const subtitleParts = [
        articlesCount > 0 && `${articlesCount} article${articlesCount === 1 ? '' : 's'}`,
        firstArticle && `"${firstArticle}"`,
        useList ? 'List format' : 'Carousel',
        useList && hasCard && '✓ Featured card',
        cardTitle && `Card: "${cardTitle}"`
      ].filter(Boolean)
      
      const mediaPreview = cardVideo ? (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            src={cardVideo}
          />
        </div>
      ) : cardImage || Article
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Featured Articles',
        media: mediaPreview
      }
    }
  }
}
