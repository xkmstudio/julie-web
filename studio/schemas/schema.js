// Document types
import page from './documents/page'
import tutorialsPage from './documents/tutorials'

import generalSettings from './documents/settings-general'
import headerSettings from './documents/settings-header'
import footerSettings from './documents/settings-footer'
import shopSettings from './documents/settings-shop'
import seoSettings from './documents/settings-seo'
import home from './documents/home'
import error from './documents/error'

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
import tutorials from './modules/tutorials'
import drawer from './modules/drawer'
import indexList from './modules/indexList'
import indexTutorials from './modules/indexTutorials'
import productContents from './modules/productContents'
import productRelated from './modules/productRelated'
import productCollection from './modules/productCollection'
import productConstruction from './modules/productConstruction'
import slideshow from './modules/slideshow'
import generalText from './modules/generalText'

// Object types
import seo from './objects/seo'

import form from './objects/form'

import navDropdown from './objects/nav-dropdown'
import navPage from './objects/nav-page'
import navLink from './objects/nav-link'

import simplePortableText from './objects/portable-simple'
import complexPortableText from './objects/portable-complex'

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


/*  ------------------------------------------ */
/*  Your Schema documents / modules / objects
/*  ------------------------------------------ */
export default [
  /* ----------------- */
    /* 1: Document types */
    page,
    tutorialsPage,

    product,
    productVariant,
    collection,
    shopHome,

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
    tutorials,
    drawer,
    indexList,
    indexTutorials,
    productContents,
    productRelated,
    productCollection,
    productConstruction,
    slideshow,
    generalText,
    
    productGalleryPhotos,
    productListingPhotos,
    productCartPhotos,
    productOption,
    productOptionValue,
    productOptionSettings,

    /* ----------------------- */
    /* 3: Generic Object types */
    seo,

    form,

    navDropdown,
    navPage,
    navLink,

    simplePortableText,
    complexPortableText,

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