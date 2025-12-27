import React from 'react'
import dynamic from 'next/dynamic'

// export {
//   default as LuckyLocalScripts,
//   LuckyIdScripts,
// } from './LuckyLocal/Scripts';

const Marquee = dynamic(() => import('./marquee'))
const Hero = dynamic(() => import('./hero'))
const ProductFeature = dynamic(() => import('./productFeature'))
const ProductShop = dynamic(() => import('./productShop'))
const TextBlock = dynamic(() => import('./textBlock'))
const MediaFeature = dynamic(() => import('./mediaFeature'))
const MediaBleed = dynamic(() => import('./mediaBleed'))
const Tutorials = dynamic(() => import('./tutorials'))
const Faqs = dynamic(() => import('./faqs'))
const IndexList = dynamic(() => import('./indexList'))
const IndexTutorials = dynamic(() => import('./indexTutorials'))
const ProductContents = dynamic(() => import('./productContents'))
const ProductRelated = dynamic(() => import('./productRelated'))
const Slideshow = dynamic(() => import('./slideshow'))
const ProductConstruction = dynamic(() => import('./productConstruction'))
const ProductCollection = dynamic(() => import('./productCollection'))
const GeneralText = dynamic(() => import('./generalText'))
const MarqueeIcons = dynamic(() => import('./marqueeIcons'))
const Media3Up = dynamic(() => import('./media3Up'))
const ProductFaqs = dynamic(() => import('./productFaqs'))
const Testimonials = dynamic(() => import('./testimonials'))
const FeaturedArticles = dynamic(() => import('./featuredArticles'))
const StoreLocator = dynamic(() => import('./storeLocator'))

export const Module = ({ module, product, activeVariant, onVariantChange }) => {
  const type = module._type

  switch (type) {
    case 'marquee':
      return <Marquee data={module} />
    case 'marqueeIcons':
      return <MarqueeIcons data={module} />
    case 'hero':
      return <Hero data={module} />
    case 'productFeature':
      return <ProductFeature data={module} />
    case 'productShop':
      return <ProductShop data={module} product={product} activeVariant={activeVariant} onVariantChange={onVariantChange} />
    case 'textBlock':
      return <TextBlock data={module} />
    case 'mediaFeature':
      return <MediaFeature data={module} />
    case 'mediaBleed':
      return <MediaBleed data={module} />
    case 'tutorials':
      return <Tutorials data={module} />
    case 'faqs':
      return <Faqs data={module} />
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
    case 'media3Up':
      return <Media3Up data={module} />
    case 'productFaqs':
      return <ProductFaqs data={module} />
    case 'testimonials':
      return <Testimonials data={module} />
    case 'featuredArticles':
      return <FeaturedArticles data={module} />
    case 'storeLocator':
      return <StoreLocator data={module} />
    default:
      return null
  }
}
