export default {
  title: 'Home',
  name: 'home',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true
    },
    {
      name: 'home',
      title: 'Homepage',
      description: 'Define a homepage from the list of pages',
      type: 'reference',
      to: [{ type: 'page' }],
      validation: Rule => Rule.required()
    },  
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ]
}
