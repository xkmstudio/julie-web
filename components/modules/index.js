import React from 'react'
import dynamic from 'next/dynamic'

const Marquee = dynamic(() => import('./marquee'))
const Hero = dynamic(() => import('./hero'))
const ProductFeature = dynamic(() => import('./productFeature'))
const TextBlock = dynamic(() => import('./textBlock'))
const MediaFeature = dynamic(() => import('./mediaFeature'))
const MediaBleed = dynamic(() => import('./mediaBleed'))
const Tutorials = dynamic(() => import('./tutorials'))
const Drawer = dynamic(() => import('./drawer'))
const IndexList = dynamic(() => import('./indexList'))
const IndexTutorials = dynamic(() => import('./indexTutorials'))
const ProductContents = dynamic(() => import('./productContents'))
const ProductRelated = dynamic(() => import('./productRelated'))
const Slideshow = dynamic(() => import('./slideshow'))
const ProductConstruction = dynamic(() => import('./productConstruction'))
const ProductCollection = dynamic(() => import('./productCollection'))
const GeneralText = dynamic(() => import('./generalText'))

export const Module = ({ module }) => {
  const type = module._type

  switch (type) {
    case 'marquee':
      return <Marquee data={module} />
    case 'hero':
      return <Hero data={module} />
    case 'productFeature':
      return <ProductFeature data={module} />
    case 'textBlock':
      return <TextBlock data={module} />
    case 'mediaFeature':
      return <MediaFeature data={module} />
    case 'mediaBleed':
      return <MediaBleed data={module} />
    case 'tutorials':
      return <Tutorials data={module} />
    case 'drawer':
      return <Drawer data={module} />
    case 'indexList':
      return <IndexList data={module} />
    case 'indexTutorials':
      return <IndexTutorials data={module} />
    case 'productContents':
      return <ProductContents data={module} />
    case 'productRelated':
      return <ProductRelated data={module} />
    case 'slideshow':
      return <Slideshow data={module} />
    case 'productConstruction':
      return <ProductConstruction data={module} />
    case 'productCollection':
      return <ProductCollection data={module} />
    case 'generalText':
      return <GeneralText data={module} />
    default:
      return null
  }
}
