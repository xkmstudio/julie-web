import React from 'react'
import NextLink from 'next/link'
import BlockContent from '@components/block-content'
import Photo from '@components/photo'
import Icon from '@components/icon'
import { Module } from '@components/modules'
import { useIsInFrame } from '@lib/helpers'

/**
 * Reusable component to render page or article content
 * This ensures we only write the rendering logic once
 */
const PageContent = ({ page, type = 'page', sanityConfig = null, isInFrame = false }) => {
  const detectedInFrame = useIsInFrame()
  const actuallyInFrame = isInFrame || detectedInFrame
  
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
    } = page

    return (
      <div className="w-full">
        {/* Article Header Section */}
        <div className="w-full flex flex-col md:flex-row gap-15 md:gap-25 pt-[calc(var(--headerHeight)+2.5rem)] pb-20 md:h-screen section-padding">
          <div className="w-full md:w-1/2 h-[100vw] md:h-full relative rounded-[1.5rem] overflow-hidden">
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
          <div className="w-full md:w-1/2 flex flex-col gap-15 md:gap-25 items-center md:p-25 mt-10 md:mt-0">
            <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-15 md:gap-25 h-full">
              <div className="w-full text-center flex-1 flex flex-col justify-center gap-20 items-center">
                {tag && (
                  <NextLink href={`/blog/tags/${tag.slug}`} className="tag">
                    {tag.title}
                  </NextLink>
                )}
                <div className="w-full my-10 md:my-0">
                  <h1 className="title-2xl">{title}</h1>
                </div>
                {(authors?.length > 0 || reviewers?.length > 0) && (
                  <div className="w-full flex flex-col gap-10">
                    <div className="flex items-center justify-center">
                      {authors?.map((author, key) => {
                        return (
                          <NextLink
                            className="underline font-lb -ml-5"
                            href={`/profiles/${author.slug}`}
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
                        return (
                          <NextLink
                            className="underline font-lb -ml-5"
                            href={`/profiles/${reviewer.slug}`}
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
                              return (
                                <NextLink
                                  className="underline font-lb"
                                  href={`/profiles/${author.slug}`}
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
                              return (
                                <React.Fragment key={key}>
                                  {key > 0 && <span>&</span>}
                                  <NextLink
                                    className="underline font-lb italic"
                                    href={`/profiles/${reviewer.slug}`}
                                  >
                                    {reviewer.title}
                                  </NextLink>
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
                <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-10 bg-white rounded-[1.5rem] julie-gradient p-1 relative mt-30">
                  <div className="rounded-[1.5rem] absolute top-0 left-0 w-full h-full blur-[5px] md:blur-[10px] julie-gradient"></div>
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

        {/* Article Content */}
        <div className="w-full max-w-[80rem] mx-auto flex flex-col items-center pt-0 md:pt-60 gap-60 section-padding">
          {articleContent && (
            <div className="w-full article">
              <BlockContent blocks={articleContent} sanityConfig={sanityConfig} />
            </div>
          )}
        </div>

        {/* Modules */}
        {modules && modules.length > 0 && (
          <div className="w-full mx-auto flex flex-col items-center md:pt-60 gap-60">
            {modules.map((module, key) => (
              <Module key={key} index={key} module={module} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render regular page content (just modules)
  return (
    <div className="w-full">
      {page.modules?.map((module, key) => (
        <Module key={key} index={key} module={module} />
      ))}
    </div>
  )
}

export default PageContent

