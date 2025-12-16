// Construct our "home" and "error" page GROQ
export const homeID = `*[_type=="generalSettings"][0].home->_id`
export const errorID = `*[_type=="generalSettings"][0].error->_id`

// Construct our "page" GROQ
export const page = `
  "type": _type,
  "slug": slug.current,
  "isHome": _id == ${homeID}
`

// Construct our "link" GROQ
export const link = `
  _key,
  _type,
  title,
  url,
  anchor,
  "page": page->{
    ${page}
  }
`

// Construct our "image meta" GROQ
export const imageMeta = `
  "alt": coalesce(alt, asset->alt),
  asset,
  crop,
  customRatio,
  hotspot,
  "id": asset->assetId,
  "type": asset->mimeType,
  "aspectRatio": asset->metadata.dimensions.aspectRatio,
  "lqip": asset->metadata.lqip,
  'width': asset->metadata.dimensions.width,
  'height': asset->metadata.dimensions.height
`

// Construct our "image meta" GROQ
export const assetMeta = `
  alt,
  'asset': image.asset,
  "id": image.asset->assetId,
  "type": image.asset->mimeType,
  "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
  "lqip": image.asset->metadata.lqip,
  'width': image.asset->metadata.dimensions.width,
  'height': image.asset->metadata.dimensions.height
`

// Construct our "media meta" GROQ
export const mediaContent = `
  'content': media[0]{
    _type,
    ...,
    _type == 'asset' => {
      ${assetMeta}
    },
    _type == 'video' => {
      'video': video.asset->url,
      poster{${imageMeta}},
      "posterUrl": poster.asset->url,
      "posterAspect": poster.asset->metadata.dimensions.aspectRatio,
      autoplayDisabled,
      sections[]{
        timestamp,
        title
      }
    }
  }
`

// Construct our "media bleed meta" GROQ (no sections)
export const mediaContentBleed = `
  'content': media[0]{
    _type,
    ...,
    _type == 'asset' => {
      ${assetMeta}
    },
    _type == 'videoBleed' => {
      'video': video.asset->url,
      poster{${imageMeta}},
      "posterUrl": poster.asset->url,
      "posterAspect": poster.asset->metadata.dimensions.aspectRatio,
      autoplayDisabled
    }
  }
`

// Construct our "video tutorial" GROQ (with sections)
export const videoTutorialContent = `
  _type,
  'video': video.asset->url,
  poster{${imageMeta}},
  "posterUrl": poster.asset->url,
  "posterAspect": poster.asset->metadata.dimensions.aspectRatio,
  autoplayDisabled,
  sections[]{
    timestamp,
    title
  }
`

// Construct our "portable text content" GROQ
export const ptContent = `
  ...,
  markDefs[]{
    ...,
    _type == "link" => {
      "url": @.url,
      "isButton": @.isButton,
      "styles": @.styles{style, isLarge, isBlock},
      "page":@.page->{
        ${page}
      }
    }
  },
  _type == "photo" => {
    ${imageMeta}
  }
`

// Construct our "blocks" GROQ
export const blocks = `
  _type == 'freeform' => {
    _type,
    _key,
    content[]{
      ${ptContent}
    },
    textAlign,
    maxWidth
  },
  _type == 'accordions' => {
    _type,
    _key,
    items[]{
      "id": _key,
      title,
      content[]{
        ${ptContent}
      }
    }
  }
`

// Construct our "product" GROQ
export const product = `
  {
    forceOutOfStock,
    preOrder,
    limitedEdition,
    soldOut,
    noteShipping,
    "publishDate": coalesce(publishDate, _createdAt),
    "slug": slug.current,
    "id": productID,
    title,
    subtitle,
    productType,
    price,
    comparePrice,
    tutorial{
      ${videoTutorialContent}
    },
    backgroundMedia{${mediaContent}},
    description[]{
      ${ptContent}
    },
    sizingChart{
      sizes[]{
        label,
        italianSize
      },
      measurements[]{
        name,
        unit,
        values[]
      }
    },
    "detailImages": {
      "left": detailImages.left{${assetMeta}},
      "front": detailImages.front{${assetMeta}},
      "right": detailImages.right{${assetMeta}},
      "back": detailImages.back{${assetMeta}}
    },
    materialsInfo[]{
      ${ptContent}
    },
    shippingInfo[]{
      ${ptContent}
    },
    returnsInfo[]{
      ${ptContent}
    },
    toolkitProductID,
    buyLinks,
    message[]{
      ${ptContent}
    },
    'galleries': productGalleries[]{
      images[]{${assetMeta}},
      variants[]->{variantID}
    },
    'swatches': productSwatches[]{
      color,
      'swatch':swatch.image.asset->url,
      variants[]->{title}
    },
    "photos": {
      "main": galleryPhotos[]{
        forOption,
        photos[]{
          ${imageMeta}
        }
      },
      "listing": listingPhotos[]{
        forOption,
        "default": listingPhoto{
          ${imageMeta}
        },
        "hover": listingPhotoHover{
          ${imageMeta}
        }
      },
    },
    heroImage{${assetMeta}},
    "previewImage": previewImage{
      ${imageMeta}
    },
    "model3D": model3D.asset->url,
    inStock,
    lowStock,
    useGallery,
    surfaceOption,
    options[]{
      name,
      position,
      values[]
    },
    optionSettings[]{
      forOption,
      "color": color->color,
    },
    "variants": *[_type == "productVariant" && productID == ^.productID && wasDeleted != true && isDraft != true]{
      "id": variantID,
      title,
      swatch,
      price,
      comparePrice,
      inStock,
      lowStock,
      forceOutOfStock,
      "photos": galleryPhotos[]{
        forOption,
        photos[]{
          ${imageMeta}
        }
      },
      cartImage{${assetMeta}},
      options[]{
        name,
        position,
        value
      },
      seo
    },    
    "klaviyoAccountID": *[_type == "generalSettings"][0].klaviyoAccountID,
    "filters": filters[]{
      "slug": filter->slug.current,
      forOption
    },
    preOrder,
  }
`

// Construct our content "modules" GROQ
export const modules = `
  _type == 'generalText' => {
    _type,
    _key,
    title,
    subtitle,
    icon,
    content[]{
      ${ptContent}
    }
  },
  _type == 'hero' => {
    _type,
    _key,
    title[]{${ptContent}},
    subtitle[]{${ptContent}},
    backgroundMedia{${mediaContent}}
  },
  _type == 'productConstruction' => {
    _type,
    _key,
    title,
    contents[]{
      title,
      media{${mediaContent}},
      pattern{${assetMeta}}
    }
  },
  _type == 'productFeature' => {
    _type,
    _key,
    products[]->{
      title,
      subtitle,
      productThumbnail{${mediaContent}},
      'slug': slug.current,
      price,
    }
  },
  _type == 'productCollection' => {
    _type,
    _key,
    products[]->{
      title,
      subtitle,
      productThumbnail{${mediaContent}},
      'slug': slug.current,
      price,
    }
  },
  _type == 'textBlock' => {
    _type,
    _key,
    title,
    subtitle,
    content[]{${ptContent}},
    cta[0]{${link}}
  },
  _type == 'mediaFeature' => {
    _type,
    _key,
    sizeMobile,
    media{${mediaContent}}
  },
  _type == 'mediaBleed' => {
    _type,
    _key,
    size,
    sizeMobile,
    media{${mediaContentBleed}}
  },
  _type == 'tutorials' => {
    _type,
    _key,
    title,
    products[]->{
      title,
      "slug": slug.current,
      subtitle,
      productType,
      tutorial{
        ${videoTutorialContent}
      }
    }
  },
  _type == 'drawer' => {
    _type,
    _key,
    title,
    cta[0]{${link}},
    icon,
    type,
    drawers[]{
      title,
      content[]{${ptContent}}
    }
  },
  _type == 'indexList' => {
    _type,
    _key,
    title,
    subtitle,
    content[]{${ptContent}},
    cta[0]{${link}}
  },
  _type == 'indexTutorials' => {
    _type,
    _key,
    title,
    subtitle,
    products[]->{
      title,
      "slug": slug.current,
      subtitle,
      productType,
      tutorial{
        ${videoTutorialContent},
        "duration": video.asset->metadata.duration
      }
    },
    cta[0]{${link}}
  },
  _type == 'productContents' => {
    _type,
    _key,
    title,
    contents[]{
      title,
      media{${mediaContent}}
    }
  },
  _type == 'productRelated' => {
    _type,
    _key,
    title,
    products[]->{
      title,
      subtitle,
      productThumbnail{${mediaContent}},
      'slug': slug.current,
      price,
    }
  },
  _type == 'slideshow' => {
    _type,
    _key,
    title,
    slides[]{
      media{${mediaContent}},
      caption
    }
  },
  _type == 'marquee' => {
    _type,
    _key,
    items[]{
      _type == 'simple' => {
        _type,
        text
      },
    },
    speed,
    reverse,
    pausable
  }
`

// Construct our "site" GROQ
export const site = `
  "site": {
    "title": *[_type == "generalSettings"][0].siteTitle,
    "rootDomain": *[_type == "generalSettings"][0].siteURL,
    "cookieConsent": *[_type == "cookieSettings"][0]{
      enabled,
      message,
      "link": link->{"type": _type, "slug": slug.current}
    },
    "shop": *[_type == "shopSettings"][0]{
      storeURL,
      cartMessage,
      cartFreeShipping,
      cartCalculator
    },
    "productCounts": [ {"slug": "all", "count": count(*[_type == "product"])} ] + *[_type == "collection"]{
      "slug": slug.current,
      "count": count(products)
    },
    "header": *[_type == "headerSettings"][0]{
      nav[]{
        ${link}
      },
      navSecondary[]{
        ${link}
      }
    },
    "footer": *[_type == "footerSettings"][0]{
      disclaimer[]{${ptContent}},
      newsletter{
        title,
        klaviyoListID,
      },
      menus[]{
        title,
        items[]{
          ${link}
        }
      }
    },
    "seo": *[_type == "seoSettings"][0]{
      metaTitle,
      metaDesc,
      shareTitle,
      shareDesc,
      shareGraphic,
      "favicon": favicon.asset->url,
      "faviconLegacy": faviconLegacy.asset->url,
      touchIcon
    },
    "gtmID": *[_type == "generalSettings"][0].gtmID,
    "pages": *[_type == "page" && wasDeleted != true && isDraft != true] | order(_updatedAt desc) {
      _id,
      _updatedAt,
      _createdAt,
      title,
      "slug": slug.current,
      "isHome": _id == ${homeID},
      "previewImage": previewImage{
        ${imageMeta}
      }
    },
    "products": *[_type == "product" && wasDeleted != true && isDraft != true] | order(_updatedAt desc) {
      _id,
      _updatedAt,
      _createdAt,
      title,
      "slug": slug.current,
      "previewImage": previewImage{
        ${imageMeta}
      }
    },
    "collections": *[_type == "collection" && wasDeleted != true && isDraft != true] | order(_updatedAt desc) {
      _id,
      _updatedAt,
      _createdAt,
      title,
      "slug": slug.current,
      "previewImage": previewImage{
        ${imageMeta}
      }
    },
    "tutorialsPage": *[_type == "tutorialsPage"][0] {
      _id,
      _updatedAt,
      _createdAt,
      title,
      "slug": "tutorials",
      "previewImage": previewImage{
        ${imageMeta}
      }
    }
  }
`

export const projectData = `
  'id': _id,
  'modules': contentModules[]{
    ${modules}
  },
  creditList[]{
    'title': credit->title,
    credits[]->{...}
  },
  title,
  'slug': slug.current,
  'services': info.tags[]->title,
  'tags': info.tags[]->{title, 'slug':slug.current},
  description[]{${ptContent}},
  seo,
  info{
    link,
    thumbVideo,
    thumbBackground{${assetMeta}},
    thumbnail{${mediaContent}},
    'poster':thumbPlaceholder.image.asset->url,
  },
  related[0]->{
    title,
    'slug': slug.current,
    info{
      thumbPlaceholder{${assetMeta}}
    }
  }
`
