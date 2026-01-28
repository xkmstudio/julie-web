export default {
  title: 'SEO / Share Settings',
  name: 'seo',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fields: [
    {
      title: 'Meta Title',
      name: 'metaTitle',
      type: 'string',
      description: 'Title used for search engines and browsers',
      validation: Rule =>
        Rule.max(50).warning('Longer titles may be truncated by search engines')
    },
    {
      title: 'Meta Description',
      name: 'metaDesc',
      type: 'text',
      rows: 3,
      description: 'Description for search engines',
      validation: Rule =>
        Rule.max(150).warning(
          'Longer descriptions may be truncated by search engines'
        )
    },
    {
      title: 'Share Title',
      name: 'shareTitle',
      type: 'string',
      description: 'Title used for social sharing cards',
      validation: Rule =>
        Rule.max(50).warning('Longer titles may be truncated by social sites')
    },
    {
      title: 'Share Description',
      name: 'shareDesc',
      type: 'text',
      rows: 3,
      description: 'Description used for social sharing cards',
      validation: Rule =>
        Rule.max(150).warning(
          'Longer descriptions may be truncated by social sites'
        )
    },
    {
      title: 'Share Graphic',
      name: 'shareGraphic',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Recommended size: 1200x630 (PNG or JPG)'
    },
    {
      title: 'Meta Directives',
      name: 'metaDirectives',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'index', value: 'index' },
          { title: 'noindex', value: 'noindex' },
          { title: 'follow', value: 'follow' },
          { title: 'nofollow', value: 'nofollow' }
        ],
        layout: 'checkbox', // Use checkboxes instead of radio buttons
        direction: 'horizontal'
      },
      description: 'Select one or more meta directives',
    },
    {
      title: 'Canonical URL',
      name: 'canonicalUrl',
      type: 'url',
      description: 'Specify the preferred URL for this page to avoid duplicate content issues',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https']
      }).warning('Must be a valid URL with http or https')
    },
    {
      title: 'Schema Markup',
      name: 'schemaMarkup',
      type: 'text',
      rows: 5,
      description: 'Enter custom schema markup in JSON-LD format. This helps search engines understand the content better.',
      validation: Rule =>
        Rule.custom(value => {
          if (!value) return true // Allow empty value
          try {
            JSON.parse(value) // Ensure valid JSON format
            return true
          } catch (err) {
            return 'Invalid JSON format. Please ensure the schema markup is a valid JSON object.'
          }
        }).warning('Ensure the schema markup is a valid JSON-LD object.')
    }
  ]
}
