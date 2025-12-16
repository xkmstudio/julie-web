import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import AccordionList from '@components/accordion-list'
import Link from '@components/link'

const Drawer = ({ data = {} }) => {
  const { title, icon, drawers, cta, type } = data

  return (
    <section
      className={`mx-auto px-10 md:px-15 drawer-container is-${type || 'standard'}`}
    >
      <div className="w-full">
        <div className="grid-standard border-b border-cement md:pr-10">
          <div className="col-span-1 relative before:content-[''] before:block before:w-[calc(100%+1.5rem)] before:h-full before:bg-cement">
            <div className="text-coal w-30 h-30 flex items-center justify-center absolute top-0 left-0">
              {icon}
            </div>
          </div>
          {title && (
            <div className="col-span-11 md:col-span-5 h-[3rem] text-center flex items-center bg-cement">
              <h2 className="title-normal text-left">{title}</h2>
            </div>
          )}
          {cta && (
            <div className="col-span-6 hidden md:flex items-center justify-end">
              <Link
                className="btn h-full flex items-center text-slate hover:text-black transition-colors duration-300"
                link={cta}
                hasArrow={true}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-60">
          <div className="flex flex-col gap-120">
            {drawers && <AccordionList type="standard" items={drawers} />}
          </div>
        </div>
      </div>
      {cta && (
        <div className="md:hidden w-full mt-60">
          <Link
            className="w-full h-full bg-black text-white flex items-center justify-center btn px-15"
            link={cta}
            hasArrow={true}
          />
        </div>
      )}
    </section>
  )
}

export default Drawer
