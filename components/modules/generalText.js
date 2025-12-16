import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'

const GeneralText = ({ data = {} }) => {
  const { title, subtitle, content, cta } = data

  return (
    <section className={`mx-auto px-15`}>
      <div className="w-full h-full">
        {(title || subtitle) && (
          <div className="grid-standard border-b border-cement">
            {title && (
              <div className="col-span-6 bg-cement px-10 h-[3rem] text-center flex items-center justify-center">
                <h2 className="title-normal">{title}</h2>
              </div>
            )}
            {subtitle && (
              <div className="col-span-6 flex items-center justify-end">
                {subtitle && <h3 className="tutle-normal text-ash">{subtitle}</h3>}
              </div>
            )}
          </div>
        )}
        <div className="p-15 flex flex-col gap-60">
          {content && (
            <div className="grid-standard">
              <div className="col-span-6 pr-15">
                <BlockContent blocks={content} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GeneralText
