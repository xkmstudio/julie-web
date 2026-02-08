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
const MediaText = dynamic(() => import('./mediaText'))
const Tutorials = dynamic(() => import('./tutorials'))
const Faqs = dynamic(() => import('./faqs'))
const IndexList = dynamic(() => import('./indexList'))
const IndexTutorials = dynamic(() => import('./indexTutorials'))
const ProductRelated = dynamic(() => import('./productRelated'))
const Slideshow = dynamic(() => import('./slideshow'))
const ProductCollection = dynamic(() => import('./productCollection'))
const GeneralText = dynamic(() => import('./generalText'))
const MarqueeIcons = dynamic(() => import('./marqueeIcons'))
const Media3Up = dynamic(() => import('./media3Up'))
const ProductFaqs = dynamic(() => import('./productFaqs'))
const Testimonials = dynamic(() => import('./testimonials'))
const FeaturedArticles = dynamic(() => import('./featuredArticles'))
const FeaturedProfiles = dynamic(() => import('./featuredProfiles'))
const StoreLocator = dynamic(() => import('./storeLocator'))

// Wrapper component that adds data-anchor attribute for anchor linking
const ModuleWrapper = ({ anchorSlug, children }) => {
  if (!anchorSlug) return children
  
  return (
    <div data-anchor={anchorSlug}>
      {children}
    </div>
  )
}

export const Module = ({ module, product, activeVariant, onVariantChange, onFrameLinkClick }) => {
  const type = module._type
  const anchorSlug = module.anchorSlug

  const renderModule = () => {
    switch (type) {
      case 'marquee':
        return <Marquee data={module} />
      case 'marqueeIcons':
        return <MarqueeIcons data={module} />
      case 'hero':
        return <Hero data={module} />
      case 'productFeature':
        return <ProductFeature data={module} onFrameLinkClick={onFrameLinkClick} />
      case 'productShop':
        return <ProductShop data={module} product={product} activeVariant={activeVariant} onVariantChange={onVariantChange} />
      case 'textBlock':
        return <TextBlock data={module} />
      case 'mediaFeature':
        return <MediaFeature data={module} />
      case 'mediaBleed':
        return <MediaBleed data={module} />
      case 'mediaText':
        return <MediaText data={module} />
      case 'tutorials':
        return <Tutorials data={module} />
      case 'faqs':
        return <Faqs data={module} />
      case 'indexList':
        return <IndexList data={module} />
      case 'indexTutorials':
        return <IndexTutorials data={module} />
      case 'productRelated':
        return <ProductRelated data={module} />
      case 'slideshow':
        return <Slideshow data={module} />
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
      case 'featuredProfiles':
        return <FeaturedProfiles data={module} />
      case 'storeLocator':
        return <StoreLocator data={module} />
      default:
        return null
    }
  }

  return (
    <ModuleWrapper anchorSlug={anchorSlug}>
      {renderModule()}
    </ModuleWrapper>
  )
}
