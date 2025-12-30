import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'

const TextBlock = ({ data = {} }) => {
  const { title, subtitle, content, cta } = data

  return (
    <section className={`section-padding w-full`}>
      <div className="w-full h-full flex flex-col gap-30 items-center justify-center max-w-[100rem] mx-auto">
        {subtitle && <div className="font-plaid text-16 md:text-18 uppercase tracking-[-.02em] leading-100 text-center">{subtitle}</div>}
        {title && <h2 className="title-2xl">{title}</h2>}
        {content && (
          <div className="w-full text-center title-lg">
            <BlockContent blocks={content} />
          </div>
        )}
        {cta && (
          <Link
            className="flex items-center justify-center btn mt-10"
            link={cta}
            hasArrow={false}
          />
        )}
      </div>
    </section>
  )
}

export default TextBlock
