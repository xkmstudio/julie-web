import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'

const IndexList = ({ data = {} }) => {
  const { title, subtitle, content, cta } = data

  return (
    <section className={`mx-auto my-120 px-15`}>
      <div className="grid-standard">
        <div className="col-span-8 bg-cement px-10 md:px-15 h-[3rem] text-center flex items-center justify-center">
          <h2 className="title-normal">{title}</h2>
        </div>
        <div className="col-span-4">
          <Link
            className="w-full h-full bg-black text-white flex items-center justify-center justify-self-end text-center"
            link={cta}
            hasArrow={true}
          />
        </div>
      </div>
      <div className="p-15 flex flex-col gap-60">
        {content && (
          <div className="grid-standard">
            <div className="col-span-8 pr-15">
              <BlockContent blocks={content} />
            </div>
          </div>
        )}
        {subtitle && (
          <div>{subtitle && <h3 className="subtitle text-ash">{subtitle}</h3>}</div>
        )}
      </div>
    </section>
  )
}

export default IndexList

