import React from 'react'
import BlockContent from '@sanity/block-content-to-react'
import cx from 'classnames'

import Photo from '@components/photo'
import CustomLink from '@components/link'

// Default block serializer fallback
const defaultBlockSerializer = (props) => {
  const { style = 'normal' } = props.node
  
  if (style === 'normal') {
    return <p>{props.children}</p>
  }
  
  // Handle other styles
  return React.createElement('div', null, props.children)
}

export const blockSerializers = {
  types: {
    block: (props) => {
      const { markDefs, style = 'normal' } = props.node

      // check if our block contains a button
      const hasButton =
        markDefs &&
        markDefs.some((c) => c._type === 'link' && c.isButton === true)

      // go through our remaing, true header styles
      if (/^h\d/.test(style)) {
        return React.createElement(
          style,
          { className: hasButton ? 'has-btn' : null },
          props.children
        )
      }

      // handle all other blocks with the default serializer
      // Use fallback if defaultSerializers is not available
      if (BlockContent.defaultSerializers?.types?.block) {
        return BlockContent.defaultSerializers.types.block(props)
      }
      return defaultBlockSerializer(props)
    },
    photo: ({ node }) => {
      return <Photo photo={node} />
    },
  },
  marks: {
    link: ({ mark, children }) => {
      return <CustomLink link={{ ...mark, ...{ title: children[0] } }} />
    },
    highlight: ({ mark, children }) => {
      return <span className='bg-acid'>{children[0]}</span>
    },
  },
}
