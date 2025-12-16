import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'

const TextBlock = ({ data = {} }) => {
  const { title, subtitle, content, cta } = data

  return (
    <section className={`mx-auto px-10 md:px-15`}>
      <div className="w-full h-full">
        {(title || cta) && (
          <div className="grid-standard">
            {title && (
              <div className="col-span-12 md:col-span-8 bg-cement px-10 md:px-15 h-[3rem] text-left flex items-center justify-start">
                <h2 className="title-normal">{title}</h2>
              </div>
            )}
            {cta && (
              <div className="col-span-4 hidden md:block">
                <Link
                  className="w-full h-full bg-black text-white flex items-center justify-center btn is-dark"
                  link={cta}
                  hasArrow={true}
                />
              </div>
            )}
          </div>
        )}
        <div className="p-10 md:pt-15 md:p-15 flex flex-col gap-60">
          {content && (
            <div className="grid-standard">
              <div className="col-span-12 md:col-span-8 pr-15">
                <BlockContent blocks={content} />
              </div>
            </div>
          )}
          {subtitle && (
            <div>
              {subtitle && <h3 className="subtitle text-ash">{subtitle}</h3>}
            </div>
          )}
        </div>
        {cta && (
          <div className="md:hidden w-full mt-60">
            <Link
              className="w-full h-full bg-black text-white flex items-center justify-center btn px-10 md:px-15"
              link={cta}
              hasArrow={true}
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default TextBlock
