import React from 'react'

import { portableRichText } from '@components/block-serializers'
import { PortableText } from '@portabletext/react'

const Content = ({ blocks }) => {
  if (!blocks) return null

  return (
    <div className="rc">
      <PortableText
        className="rc"
        value={blocks}
        components={portableRichText}
      />
    </div>
  )
}

export default Content
