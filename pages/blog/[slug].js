import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { getArticle, getAllDocSlugs } from '@data'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import Photo from '@components/photo'
import BlockContent from '@components/block-content'
import ArticleCard from '@components/related-card'
import Icon from '@components/icon'
import { Module } from '@components/modules'

const Article = ({ data, sanityConfig }) => {
  const router = useRouter()

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  const { site, page } = data

  const {
    title,
    content,
    image,
    date,
    related,
    summary,
    excerpt,
    tag,
    authors,
    reviewers,
    modules,
  } = page

  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={page}>
          <div className="w-full">
            <div className="w-full flex gap-15 md:gap-25 pt-[calc(var(--headerHeight)+2.5rem)] pb-20 h-screen section-padding">
              <div className="w-1/2 h-full relative rounded-[1.5rem] overflow-hidden">
                <Photo
                  photo={image}
                  width={2400}
                  srcSizes={[800, 1200, 1600, 2400]}
                  sizes="100%"
                  layout={'fill'}
                  className={'object-cover h-full w-full'}
                />
              </div>
              <div className="w-1/2 flex flex-colflex flex-col gap-15 md:gap-25 items-center p-25">
                <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-15 md:gap-25 h-full">
                  <div className="w-full text-center flex-1 flex flex-col justify-center gap-20 items-center">
                    <NextLink href={`/blog/tags/${tag.slug}`} className="tag">
                      {tag.title}
                    </NextLink>
                    <h1 className="title-2xl">{title}</h1>
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
                                    layout={'fill'}
                                    className={'object-cover h-full w-full'}
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
                                    layout={'fill'}
                                    className={'object-cover h-full w-full'}
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
                    <div className="w-full max-w-[62rem] mx-auto flex flex-col gap-10 bg-white rounded-[1.5rem] julie-gradient p-1 relative">
                      <div className="rounded-[1.5rem] absolute top-0 left-0 w-full h-full blur-[10px] julie-gradient"></div>
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
            <div className="w-full max-w-[80rem] mx-auto flex flex-col items-center pt-60 gap-60 page-margin">
              <div className="w-full article">
                <BlockContent blocks={content} sanityConfig={sanityConfig} />
              </div>
            </div>
            <div className="w-full mx-auto flex flex-col items-center pt-60 gap-60">
              {modules?.map((module, key) => {
                return (
                  <React.Fragment key={key}>
                    <Module key={key} index={key} module={module} />
                  </React.Fragment>
                )
              })}
            </div>
            {/* Author and reviewer section */}
            {(authors?.length > 0 || reviewers?.length > 0) && (
              <div className="w-full flex gap-15 md:gap-25 section-padding">
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
                    <NextLink
                      key={key}
                      href={`/profiles/${person.slug}`}
                      className="flex-1 rounded-[1.5rem] border border-pink p-20"
                    >
                      <div className="w-fullw-full flex gap-10">
                        <div className="w-50 h-50 rounded-full overflow-hidden relative">
                          <Photo
                            photo={person.image}
                            width={600}
                            srcSizes={[800, 1200, 1600, 2400]}
                            sizes="100%"
                            layout={'fill'}
                            className={'object-cover h-full w-full'}
                          />
                        </div>
                        <div className="flex flex-col gap-5">
                          <div className="">{person.title}</div>
                          <div>{person.role}</div>
                        </div>
                      </div>
                      <div className="w-full text-14 mt-20">
                        <BlockContent blocks={person.bio} />
                      </div>
                    </NextLink>
                  )
                })}
              </div>
            )}
            <div className="w-full flex flex-col items-center gap-35 my-90 section-padding">
              <div className='title-2xl'>still have questions?</div>
              <button className="btn" href="/contact">
                Ask Julie
              </button>
            </div>
            {related && (
              <div className="mt-60 md:mt-100 flex flex-col items-center gap-30 md:gap-60 pb-60 md:pb-120 section-padding">
                <div className="page-margin flex flex-col md:flex-row gap-20 w-full">
                  {related?.map((item, key) => {
                    return (
                      <React.Fragment key={key}>
                        <ArticleCard item={item} />
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Layout>
      )}
    </>
  )
}

export async function getStaticProps({ params, preview, previewData }) {
  const eventData = await getArticle(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  return {
    props: {
      data: eventData,
      sanityConfig: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_PROJECT_DATASET,
      },
    },
  }
}

export async function getStaticPaths() {
  const allArticles = await getAllDocSlugs('article')

  return {
    paths:
      allArticles?.map((article) => {
        return {
          params: {
            slug: article.slug,
            id: article._id,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default Article
