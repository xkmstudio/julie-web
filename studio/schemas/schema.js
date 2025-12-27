// Document types
import page from './documents/page'

import generalSettings from './documents/settings-general'
import headerSettings from './documents/settings-header'
import footerSettings from './documents/settings-footer'
import shopSettings from './documents/settings-shop'
import seoSettings from './documents/settings-seo'
import home from './documents/home'
import error from './documents/error'
import blog from './documents/blog'
import article from './documents/article'
import tag from './documents/tag'
import profile from './documents/profile'

import product from './documents/shop-product'
import productVariant from './documents/shop-variant'
import collection from './documents/shop-collection'
import shopHome from './documents/shop-home'

// Module types
import hero from './modules/hero'
import featuredProducts from './modules/productFeature'
import marquee from './modules/marquee'
import productShop from './modules/productShop'
import textBlock from './modules/textBlock'
import mediaFeature from './modules/mediaFeature'
import mediaBleed from './modules/mediaBleed'
import faqs from './modules/faqs'
import indexList from './modules/indexList'
import indexTutorials from './modules/indexTutorials'
import productContents from './modules/productContents'
import productRelated from './modules/productRelated'
import productCollection from './modules/productCollection'
import productConstruction from './modules/productConstruction'
import slideshow from './modules/slideshow'
import generalText from './modules/generalText'
import marqueeIcons from './modules/marqueeIcons'
import media3Up from './modules/media3Up'
import gradient from './modules/gradient'
import testimonials from './modules/testimonials'
import featuredArticles from './modules/featuredArticles'
import storeLocator from './modules/storeLocator'

// Object types
import seo from './objects/seo'

import form from './objects/form'

import navDropdown from './objects/nav-dropdown'
import navPage from './objects/nav-page'
import navLink from './objects/nav-link'
import navJulie from './objects/nav-julie'
import link from './objects/link'

import simplePortableText from './objects/portable-simple'
import complexPortableText from './objects/portable-complex'
import articlePortableText from './objects/portable-article'

import accordions from './objects/accordions'
import accordion from './objects/accordion'

import asset from './objects/asset'
import a11yImage from './objects/a11yImage'
import video from './objects/video'
import videoBleed from './objects/video-bleed'
import videoTutorial from './objects/video-tutorial'
import media from './objects/media'
import mediaBleedObject from './objects/media-bleed'

import productGalleryPhotos from './objects/product-gallery-photos'
import productListingPhotos from './objects/product-listing-photos'
import productCartPhotos from './objects/product-cart-photos'
import productOption from './objects/product-option'
import productOptionValue from './objects/product-option-value'
import productOptionSettings from './objects/product-option-settings'
import productFaqs from './modules/productFaqs'


/*  ------------------------------------------ */
/*  Your Schema documents / modules / objects
/*  ------------------------------------------ */
export default [
  /* ----------------- */
    /* 1: Document types */
    page,

    product,
    productVariant,
    collection,
    shopHome,
    blog,
    article,
    tag,
    profile,

    generalSettings,
    headerSettings,
    footerSettings,
    shopSettings,
    seoSettings,
    home,
    error,

    /* --------------- */
    /* 2: Module types */
    hero,
    marquee,
    productShop,
    featuredProducts,
    textBlock,
    mediaFeature,
    mediaBleed,
    faqs,
    indexList,
    indexTutorials,
    productContents,
    productRelated,
    productCollection,
    productConstruction,
    slideshow,
    generalText,
    marqueeIcons,
    media3Up,
    gradient,
    testimonials,
    featuredArticles,
    storeLocator,
    
    productGalleryPhotos,
    productListingPhotos,
    productCartPhotos,
    productOption,
    productOptionValue,
    productOptionSettings,
    productFaqs,
    /* ----------------------- */
    /* 3: Generic Object types */
    seo,

    form,

    navDropdown,
    navPage,
    navLink,
    navJulie,
    link,

    simplePortableText,
    complexPortableText,
    articlePortableText,

    accordions,
    accordion,

    asset,
    a11yImage,
    video,
    videoBleed,
    videoTutorial,
    media,
    mediaBleedObject,
]