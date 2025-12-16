import React from 'react'
import { m } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

import BlockContent from '@components/block-content'
import Link from '@components/link'
import Carousel from '@components/carousel'

const Slideshow = ({ data = {} }) => {
  const { title, slides } = data  

  return (
    <section className={`no-border h-screen w-full relative bg-black border-b border-cement`}>
      <div className="w-full h-full flex items-center justify-center">
        <Carousel slides={slides} title={title} hasNav={true} />
      </div>
    </section>
  )
}

export default Slideshow
