import { PaperPlaneTilt } from 'phosphor-react'

export default {
  title: 'Newsletter Form',
  name: 'newsletter',
  type: 'object',
  icon: PaperPlaneTilt,
  fields: [
    {
      name: 'klaviyoNote',
      type: 'note',
      options: {
        headline: 'Gotcha',
        message:
          'You must have a Klaviyo Private API Key added to your Vercel Environment Variables for this form to work properly.',
        tone: 'caution'
      }
    },
    {
      title: 'Klaviyo List ID',
      name: 'klaviyoListID',
      type: 'string',
      description: 'Your Klaviyo List to subscribe emails to',
      validation: Rule => Rule.required()
    },
    {
      title: 'Submit Button Text',
      name: 'submit',
      type: 'string',
      description: 'Text displayed on the submit button (e.g., "Subscribe", "Sign Up")',
      initialValue: 'Subscribe'
    },
    {
      title: 'Success Message',
      name: 'successMsg',
      type: 'complexPortableText',
      description: 'Message shown after successful subscription'
    },
    {
      title: 'Error Message',
      name: 'errorMsg',
      type: 'complexPortableText',
      description: 'Message shown if subscription fails'
    },
    {
      title: 'Agreement Statement',
      name: 'terms',
      type: 'simplePortableText',
      description: 'Terms and conditions text (e.g., "By subscribing, you agree to...")'
    }
  ],
  preview: {
    select: {
      klaviyoListID: 'klaviyoListID',
      submit: 'submit',
      hasSuccessMsg: 'successMsg',
      hasErrorMsg: 'errorMsg',
      hasTerms: 'terms'
    },
    prepare({ klaviyoListID, submit, hasSuccessMsg, hasErrorMsg, hasTerms }) {
      const displayTitle = 'Newsletter Form'
      const subtitleParts = [
        klaviyoListID && `List: ${klaviyoListID}`,
        submit && `"${submit}"`,
        hasSuccessMsg && '✓ Success msg',
        hasErrorMsg && '✓ Error msg',
        hasTerms && '✓ Terms'
      ].filter(Boolean)
      
      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' • ') || 'Newsletter Form',
        media: PaperPlaneTilt
      }
    }
  }
}
