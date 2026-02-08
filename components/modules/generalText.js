import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'

const GeneralText = ({ data = {} }) => {
  const { title, subtitle, content, cta } = data

  return (
    <section className={`mx-auto section-padding`}>
      <div className="w-full h-full max-w-[65rem] mx-auto">
        {(title || subtitle) && (
          <div className="w-full flex flex-col gap-20 mb-60">
            {subtitle && (
              <div className="font-plaid text-16 md:text-18 uppercase tracking-[-.02em] leading-100 text-center">{subtitle}</div>
            )}
            {title && <h1 className="title-2xl text-center">{title}</h1>}
          </div>
        )}
        {content && (
          <div className="w-full article-lists md:text-18">
            <BlockContent blocks={content} />
          </div>
        )}
      </div>
    </section>
  )
}

export default GeneralText
