import React from 'react'

import { portableRichText, createPortableTextSerializers } from '@components/block-serializers'
import { PortableText } from '@portabletext/react'

const Content = ({ blocks, onFrameLinkClick = null }) => {
  if (!blocks) return null

  // Use serializers with frame link handler if provided
  const serializers = onFrameLinkClick
    ? createPortableTextSerializers(onFrameLinkClick)
    : portableRichText

  return (
    <div className="rc">
      <PortableText
        className="rc"
        value={blocks}
        components={serializers}
      />
    </div>
  )
}

export default Content
