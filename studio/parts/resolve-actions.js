import React, { useState } from 'react'
import axios from 'axios'

import sanityClient from 'part:@sanity/base/client'

import defaultResolve, {
  PublishAction,
  DiscardChangesAction,
  DeleteAction,
  UnpublishAction
} from 'part:@sanity/base/document-actions'

import { Eye } from 'phosphor-react'

const remoteURL = window.location.protocol + '//' + window.location.hostname
const localURL = 'http://localhost:3000'
const frontendURL =
  window.location.hostname === 'localhost' ? localURL : remoteURL

const singletons = [
  'generalSettings',
  'cookieSettings',
  'promoSettings',
  'headerSettings',
  'footerSettings',
  'shopSettings',
  'seoSettings'
]

const editAndDelete = ['project']

const previews = ['page', 'project']

const PreviewAction = props => {
  const slug = props.draft
    ? props.draft.slug?.current
    : props.published?.slug?.current

  return {
    label: 'Open Preview',
    icon: () => <Eye weight="light" data-sanity-icon="eye" />,
    onHandle: async () => {
      console.clear()

      const localURL = 'http://localhost:3000'
      const remoteURL = await sanityClient.fetch(
        `*[_type == "generalSettings"][0].siteURL`
      )

      const typeSlug =
        props.type == 'project'
          ? 'work/'
          : ''

      const frontendURL =
        window.location.hostname === 'localhost' ? localURL : remoteURL

      window.open(
        `${frontendURL}/api/preview?token=HULL&type=${
          props.type
        }&slug=${typeSlug}${slug || ''}`
      )
    }
  }
}

export default function resolveDocumentActions(props) {
  const isSingle = singletons.indexOf(props.type) > -1
  const canEditDelete = editAndDelete.indexOf(props.type) > -1
  const canPreview = previews.indexOf(props.type) > -1

  if (isSingle) {
    return [
      PublishAction,
      DiscardChangesAction,
      ...(canPreview ? [PreviewAction] : [])
    ]
  }

  if (canEditDelete) {
    return [
      PublishAction,
      DiscardChangesAction,
      UnpublishAction,
      DeleteAction,
      ...(canPreview ? [PreviewAction] : [])
    ]
  }

  return [...defaultResolve(props), ...(canPreview ? [PreviewAction] : [])]
}
