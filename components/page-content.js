import React, { useState, useEffect, useCallback } from 'react'
import NextLink from 'next/link'
import BlockContent from '@components/block-content'
import Photo from '@components/photo'
import Icon from '@components/icon'
import { Module } from '@components/modules'
import { useIsInFrame, useWindowSize, hasObject } from '@lib/helpers'
import cx from 'classnames'
import AuthorCard from '@components/author-card'
import ArticleCard from '@components/related-card'
import ProductCarousel from '@components/product-carousel'
import ProductHero from '@components/modules/productHero'
import Gradient from '@components/gradient'
import Link from '@components/link'

const MOBILE_BREAKPOINT = 850

/**
 * Reusable component to render page or article content
 * This ensures we only write the rendering logic once
 */
const PageContent = ({
  page,
  type = 'page',
  sanityConfig = null,
  isInFrame = false,
  onFrameLinkClick = null,
}) => {
  const detectedInFrame = useIsInFrame()
  const actuallyInFrame = isInFrame || detectedInFrame
  const { width } = useWindowSize()
  const [isClient, setIsClient] = useState(false)
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT

  // Product-specific state
  const [product, setProduct] = useState(
    type === 'product' ? page?.product : null
  )
  const [activeVariantID, setActiveVariantID] = useState(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize product variant on mount
  useEffect(() => {
    if (type === 'product' && page?.product?.variants?.length > 0) {
      // Find default variant
      const defaultVariant = page.product.variants.find((v) => {
        const option = {
          name: page.product.options?.[0]?.name,
          value: page.product.options?.[0]?.values[0],
          position: page.product.options?.[0]?.position,
        }
        return hasObject(v.options, option)
      })
      setActiveVariantID(defaultVariant?.id ?? page.product.variants[0].id)
      setProduct(page.product)
    }
  }, [type, page])

  // Handle variant change for products
  const updateVariant = useCallback(
    (id) => {
      if (type === 'product' && page?.product?.variants) {
        const isValidVariant = page.product.variants.find((v) => v.id == id)
        if (isValidVariant) {
          setActiveVariantID(id)
        }
      }
    },
    [type, page]
  )

  const activeVariant =
    type === 'product' && product?.variants
      ? product.variants.find((v) => v.id == activeVariantID) ||
      product.variants[0]
      : null

  if (!page) return null

  // Render article content
  if (type === 'article') {
    const {
      title,
      content,
      image,
      tag,
      summary,
      content: articleContent,
      authors,
      reviewers,
      modules,
      related,
      useGradient,
      gradient,
      editorialStandards,
      globalCta,
    } = page

    return (
      <div className="w-full">
        {/* Article Header Section */}
        <div
          className={cx(
            'w-full flex flex-col pb-20 section-padding relative',
            {
              'pt-[calc(var(--headerHeight)+2.5rem)]': !actuallyInFrame,
              'md:min-h-screen': !actuallyInFrame,
              'min-h-[50vh]': actuallyInFrame && useGradient && gradient,
              'md:flex-row gap-15 md:gap-25': image && !(useGradient && gradient) && !actuallyInFrame,
              'gap-15': actuallyInFrame && image && !(useGradient && gradient),
              'justify-center items-center': useGradient && gradient,
            }
          )}
        >
          <div className={cx('w-full flex flex-col relative', {
            'md:flex-row gap-0 md:gap-25': image && !(useGradient && gradient) && !actuallyInFrame,
            'gap-15': actuallyInFrame && image && !(useGradient && gradient),
            'justify-center items-center h-full min-h-hero': useGradient && gradient,
          })}>
            {image && !(useGradient && gradient) && (
              <div className={cx('w-full relative rounded-[1.5rem] overflow-hidden', {
                'aspect-square': actuallyInFrame,
                'h-[100vw] md:w-1/2 md:h-full': !actuallyInFrame && !(useGradient && gradient),
                'hidden md:block': useGradient && gradient,
              })}>
                {image && (
                  <Photo
                    photo={image}
                    width={2400}
                    srcSizes={[800, 1200, 1600, 2400]}
                    sizes="100%"
                    layout="fill"
                    className="object-cover h-full w-full"
                  />
                )}
              </div>
            )}
            {useGradient && gradient && (
              <div className={cx(
                'absolute left-0 top-0 w-full h-full rounded-[1.5rem] overflow-hidden',
                { 'min-h-[50vh]': actuallyInFrame }
              )}>
                <Gradient gradient={gradient} />
                <div className="absolute bottom-0 left-0 w-full h-[10%] bg-gradient-to-b from-transparent to-white pointer-events-none" />
              </div>
            )}
            <div className={cx('relative z-2 mx-auto flex flex-col items-center', {
              'gap-15': actuallyInFrame,
              'gap-15 md:gap-25 md:p-25 mt-20 md:mt-0': !actuallyInFrame,
              'w-full': actuallyInFrame && image && !(useGradient && gradient),
              'w-full md:w-1/2': !actuallyInFrame && image && !(useGradient && gradient),
              'w-full h-full': useGradient && gradient,
            })}>
              <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-15 md:gap-25 h-full px-15 md:px-0">
                <div className="w-full text-center flex-1 flex flex-col justify-center gap-20 items-center">
                  {tag &&
                    (actuallyInFrame && onFrameLinkClick ? (
                      <a
                        href={`/blog?tag=${tag.slug}`}
                        onClick={(e) => {
                          e.preventDefault()
                          onFrameLinkClick(`/blog?tag=${tag.slug}`)
                        }}
                        className="tag mt-15"
                      >
                        {tag.title}
                      </a>
                    ) : (
                      <NextLink href={`/blog?tag=${tag.slug}`} className="tag">
                        {tag.title}
                      </NextLink>
                    ))}
                  <div className="w-full my-10 md:my-0">
                    <h1 className="title-2xl">{title}</h1>
                  </div>
                  {(authors?.length > 0 || reviewers?.length > 0) && (
                    <div className="w-full flex flex-col gap-10">
                      <div className="flex items-center justify-center">
                        {authors?.map((author, key) => {
                          const authorHref = `/profiles/${author.slug}`
                          return actuallyInFrame && onFrameLinkClick ? (
                            <a
                              key={key}
                              className="underline font-lb -ml-5"
                              href={authorHref}
                              onClick={(e) => {
                                e.preventDefault()
                                onFrameLinkClick(authorHref)
                              }}
                            >
                              <div className="w-50 h-50 rounded-full overflow-hidden relative">
                                <Photo
                                  photo={author.image}
                                  width={600}
                                  srcSizes={[800, 1200, 1600, 2400]}
                                  sizes="100%"
                                  layout="fill"
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            </a>
                          ) : (
                            <NextLink
                              className="underline font-lb -ml-5"
                              href={authorHref}
                              key={key}
                            >
                              <div className="w-50 h-50 rounded-full overflow-hidden relative">
                                <Photo
                                  photo={author.image}
                                  width={600}
                                  srcSizes={[800, 1200, 1600, 2400]}
                                  sizes="100%"
                                  layout="fill"
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            </NextLink>
                          )
                        })}
                        {reviewers?.map((reviewer, key) => {
                          const reviewerHref = `/profiles/${reviewer.slug}`
                          return actuallyInFrame && onFrameLinkClick ? (
                            <a
                              key={key}
                              className="underline font-lb -ml-5"
                              href={reviewerHref}
                              onClick={(e) => {
                                e.preventDefault()
                                onFrameLinkClick(reviewerHref)
                              }}
                            >
                              <div className="w-50 h-50 rounded-full overflow-hidden relative">
                                <Photo
                                  photo={reviewer.image}
                                  width={600}
                                  srcSizes={[800, 1200, 1600, 2400]}
                                  sizes="100%"
                                  layout="fill"
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            </a>
                          ) : (
                            <NextLink
                              className="underline font-lb -ml-5"
                              href={reviewerHref}
                              key={key}
                            >
                              <div className="w-50 h-50 rounded-full overflow-hidden relative">
                                <Photo
                                  photo={reviewer.image}
                                  width={600}
                                  srcSizes={[800, 1200, 1600, 2400]}
                                  sizes="100%"
                                  layout="fill"
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            </NextLink>
                          )
                        })}
                      </div>
                      {authors?.length > 0 && (
                        <div>
                          <div className="w-full flex justify-center items-center gap-3">
                            <div>Written by</div>
                            <div>
                              {authors?.map((author, key) => {
                                const authorHref = `/profiles/${author.slug}`
                                return actuallyInFrame && onFrameLinkClick ? (
                                  <a
                                    key={key}
                                    className="underline font-lb"
                                    href={authorHref}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      onFrameLinkClick(authorHref)
                                    }}
                                  >
                                    {author.title}
                                  </a>
                                ) : (
                                  <NextLink
                                    className="underline font-lb"
                                    href={authorHref}
                                    key={key}
                                  >
                                    {author.title}
                                  </NextLink>
                                )
                              })}
                            </div>
                          </div>
                          <div className="w-full flex justify-center items-center gap-2">
                            {authors[0].role}
                          </div>
                        </div>
                      )}
                      {reviewers?.length > 0 && (
                        <div>
                          <div className="w-full flex flex-col justify-center items-center">
                            <div>Reviewed by</div>
                            <div className="flex flex-wrap justify-center items-center gap-3">
                              {reviewers.map((reviewer, key) => {
                                const reviewerHref = `/profiles/${reviewer.slug}`
                                return (
                                  <React.Fragment key={key}>
                                    {key > 0 && <span>&</span>}
                                    {actuallyInFrame && onFrameLinkClick ? (
                                      <a
                                        className="underline font-lb italic"
                                        href={reviewerHref}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          onFrameLinkClick(reviewerHref)
                                        }}
                                      >
                                        {reviewer.title}
                                      </a>
                                    ) : (
                                      <NextLink
                                        className="underline font-lb italic"
                                        href={reviewerHref}
                                      >
                                        {reviewer.title}
                                      </NextLink>
                                    )}
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {summary && (
                  <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-10 bg-white rounded-[1.5rem] julie-gradient p-1 relative mt-30 mb-30">
                    <div className="rounded-[1.5rem] absolute top-0 left-0 w-full h-full blur-[5px] md:blur-[10px] julie-gradient has-blur"></div>
                    <div className="relative z-2 w-full flex flex-col gap-10 bg-white p-20 rounded-[1.5rem]">
                      <div className="flex items-center gap-10">
                        <div className="w-[2rem]">
                          <Icon name="star" viewBox="0 0 19 19" />
                        </div>
                        <div className="font-plaid text-14 tracking-[-.02em] uppercase">
                          Summary
                        </div>
                      </div>
                      <div className="text-16">
                        <BlockContent blocks={summary} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="w-full max-w-[80rem] mx-auto flex flex-col items-center pt-0 md:pt-60 gap-60 section-padding">
          {articleContent && (
            <div className="w-full article">
              <BlockContent
                blocks={articleContent}
                sanityConfig={sanityConfig}
                onFrameLinkClick={onFrameLinkClick}
              />
            </div>
          )}
        </div>

        {/* Modules */}
        {modules && modules.length > 0 && (
          <div className="w-full mx-auto flex flex-col items-center md:pt-60 gap-60">
            {modules.map((module, key) => (
              <Module
                key={key}
                index={key}
                module={module}
                onFrameLinkClick={onFrameLinkClick}
              />
            ))}
          </div>
        )}

        {/* Editorial Standards */}
        {editorialStandards && editorialStandards.length > 0 && (
          <div className="w-full max-w-[80rem] section-padding mx-auto mt-60 md:mt-60 pb-60 md:pb-120 border-t border-ash pt-60 md:pt-60">
            <div className="font-plaid text-16 md:text-18 uppercase tracking-[-.02em] leading-100 text-center">Editorial Standards</div>
            <div className="w-full mt-50">
              <BlockContent
                blocks={editorialStandards}
                sanityConfig={sanityConfig}
                onFrameLinkClick={onFrameLinkClick}
              />
            </div>
          </div>
        )}

        {/* Author and reviewer section */}
        {(authors?.length > 0 || reviewers?.length > 0) && (
          <div
            className={`w-full section-padding mt-60 ${isClient && (isMobile || actuallyInFrame) ? 'overflow-hidden' : ''
              }`}
          >
            {(authors?.length == 1 && !reviewers) ? (
              <AuthorCard
                person={authors[0]}
                onFrameLinkClick={onFrameLinkClick}
                className="w-full max-w-[65rem] mx-auto"
              />
            )
              : isClient && (isMobile || actuallyInFrame) ? (
                <ProductCarousel
                  items={[
                    ...(authors?.map((author) => ({
                      ...author,
                      type: 'author',
                    })) || []),
                    ...(reviewers?.map((reviewer) => ({
                      ...reviewer,
                      type: 'reviewer',
                    })) || []),
                  ]}
                  renderSlide={(person, key) => (
                    <AuthorCard
                      key={key}
                      person={person}
                      className="w-full"
                      onFrameLinkClick={onFrameLinkClick}
                    />
                  )}
                  slideClassName="w-[83.333%] min-w-[83.333%] ml-15"
                  enabled={isClient && (isMobile || actuallyInFrame)}
                />
              ) : (
                <div className="w-full flex gap-15 md:gap-25">
                  {[
                    ...(authors?.map((author) => ({
                      ...author,
                      type: 'author',
                    })) || []),
                    ...(reviewers?.map((reviewer) => ({
                      ...reviewer,
                      type: 'reviewer',
                    })) || []),
                  ].map((person, key) => {
                    return (
                      <AuthorCard
                        key={key}
                        person={person}
                        onFrameLinkClick={onFrameLinkClick}
                      />
                    )
                  })}
                </div>
              )}
          </div>
        )}

        {/* Global CTA */}
        {globalCta && globalCta.title && globalCta.link && (
          <div className="w-full flex flex-col items-center gap-35 my-60 md:my-90 section-padding">
            <div className="title-2xl text-center">{globalCta.title}</div>
            <Link
              link={globalCta.link}
              onFrameLinkClick={onFrameLinkClick}
              className="btn"
            >
              {globalCta.link.title || 'learn more'}
            </Link>
          </div>
        )}

        {/* Related articles */}
        {related && related.length > 0 && (
          <div
            className={`mt-60 md:mt-100 flex flex-col items-center gap-30 md:gap-60 pb-60 md:pb-120 section-padding ${isClient && (isMobile || actuallyInFrame) ? 'overflow-hidden' : ''
              }`}
          >
            <div className="title-2xl text-center">related articles</div>
            {isClient && (isMobile || actuallyInFrame) ? (
              <ProductCarousel
                items={related}
                renderSlide={(item, key) => (
                  <ArticleCard
                    key={key}
                    item={item}
                    articleHref={item.slug ? `/blog/${item.slug}` : null}
                    onFrameLinkClick={onFrameLinkClick}
                  />
                )}
                slideClassName="w-[83.333%] min-w-[83.333%] ml-15"
                enabled={isClient && (isMobile || actuallyInFrame)}
              />
            ) : (
              <div className="flex flex-col md:flex-row gap-40 md:gap-20 w-full">
                {related.map((item, key) => {
                  return (
                    <React.Fragment key={key}>
                      <ArticleCard
                        item={item}
                        className="w-full md:w-1/2"
                        articleHref={item.slug ? `/blog/${item.slug}` : null}
                        onFrameLinkClick={onFrameLinkClick}
                      />
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </div>
        )}




      </div>
    )
  }

  // Render product content
  if (type === 'product' && page?.product) {
    return (
      <div className="w-full">
        <ProductHero
          product={product || page.product}
          modules={page.modules}
          onVariantChange={updateVariant}
          activeVariant={activeVariant}
          isInFrame={actuallyInFrame}
        />
        {page.modules?.map((module, key) => (
          <Module
            key={key}
            index={key}
            module={module}
            product={product || page.product}
            activeVariant={activeVariant}
            onVariantChange={updateVariant}
            onFrameLinkClick={onFrameLinkClick}
            isInFrame={actuallyInFrame}
          />
        ))}
      </div>
    )
  }

  // Render profile content
  if (type === 'profile') {
    const { title, image, role, bio, articles } = page
    // Use mobile layout when in frame
    const useMobileLayout = actuallyInFrame

    return (
      <div className="w-full">
        <div className={cx(
          'w-full flex gap-15 pt-0 pb-20 section-padding',
          useMobileLayout
            ? 'flex-col min-h-[50rem]'
            : 'flex-col md:flex-row md:h-screen md:gap-25 min-h-[50rem]'
        )}>
          <div className={cx(
            'relative rounded-[1.5rem] overflow-hidden',
            useMobileLayout
              ? 'w-full aspect-square'
              : 'w-full md:w-1/2 aspect-square md:aspect-auto md:h-full'
          )}>
            {image && (
              <Photo
                photo={image}
                width={2400}
                srcSizes={[800, 1200, 1600, 2400]}
                sizes="100%"
                layout={'fill'}
                className={'object-cover h-full w-full'}
              />
            )}
          </div>
          <div className={cx(
            'flex flex-col items-center p-25',
            useMobileLayout
              ? 'w-full gap-15'
              : 'w-full md:w-1/2 gap-15 md:gap-25'
          )}>
            <div className={cx(
              'w-full max-w-[60rem] mx-auto flex flex-col h-full',
              useMobileLayout ? 'gap-15' : 'gap-15 md:gap-25'
            )}>
              <div className="w-full text-center flex-1 flex flex-col justify-center gap-35 items-center">
                <div className="w-full flex flex-col gap-20">
                  <h1 className="title-2xl">{title}</h1>
                  {role && <div className="title-sm">{role}</div>}
                </div>
                <div className="w-full text-16">
                  <BlockContent
                    blocks={bio}
                    onFrameLinkClick={onFrameLinkClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {articles && articles.length > 0 && (
          <div className={cx(
            'w-full flex flex-col items-center section-padding',
            useMobileLayout
              ? 'gap-30 mt-30 mb-90'
              : 'gap-30 md:gap-50 mt-30 mb-90 md:my-90'
          )}>
            <div className="title-lg text-center">Articles with {title}</div>
            <div className="grid-standard gap-y-40">
              {articles.map((article, key) => {
                const articleHref = `/blog/${article.slug}`
                return (
                  <ArticleCard
                    key={key}
                    item={article}
                    className={useMobileLayout ? 'col-span-12' : 'col-span-12 md:col-span-4'}
                    articleHref={articleHref}
                    onFrameLinkClick={onFrameLinkClick}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render regular page content (just modules)
  return (
    <div className="w-full">
      {page.modules?.map((module, key) => (
        <Module
          key={key}
          index={key}
          module={module}
          onFrameLinkClick={onFrameLinkClick}
        />
      ))}
    </div>
  )
}

export default PageContent
