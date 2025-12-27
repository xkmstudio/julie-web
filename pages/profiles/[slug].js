import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { getProfile, getAllDocSlugs } from '@data'

import NotFoundPage from '@pages/404'

import Layout from '@components/layout'
import Photo from '@components/photo'
import BlockContent from '@components/block-content'
import ArticleCard from '@components/related-card'
import Icon from '@components/icon'
import { Module } from '@components/modules'

const Profile = ({ data, sanityConfig }) => {
  const router = useRouter()

  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />
  }

  const { site, page } = data

  const {
    title,
    image,
    role,
    bio,
    articles,
  } = page

  return (
    <>
      {!router.isFallback && (
        <Layout site={site} page={page}>
          <div className="w-full">
            <div className="w-full h-screen min-h-[50rem] flex gap-15 md:gap-25 pt-[calc(var(--headerHeight)+2.5rem)] pb-20 section-padding">
              <div className="w-1/2 h-full relative rounded-[1.5rem] overflow-hidden">
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
              <div className="w-1/2 flex flex-col gap-15 md:gap-25 items-center p-25">
                <div className="w-full max-w-[60rem] mx-auto flex flex-col gap-15 md:gap-25 h-full">
                  <div className="w-full text-center flex-1 flex flex-col justify-center gap-35 items-center">
                    <div className="w-full flex flex-col gap-20">
                      <h1 className="title-2xl">{title}</h1>
                      {role && (
                        <div className="title-sm">{role}</div>
                      )}
                    </div>
                    <div className="w-full text-16">
                      <BlockContent blocks={bio} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {articles && articles.length > 0 && (
              <div className="w-full flex flex-col items-center gap-50 my-90 section-padding">
                <div className="title-lg text-center">Articles with {title}</div>
                <div className="flex flex-col md:flex-row gap-20 w-full">
                  {articles.map((article, key) => {
                    return (
                      <React.Fragment key={key}>
                        <ArticleCard item={article} />
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
  const eventData = await getProfile(params.slug, {
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
  const allProfiles = await getAllDocSlugs('profile')

  return {
    paths:
      allProfiles?.map((profile) => {
        return {
          params: {
            slug: profile.slug,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default Profile
