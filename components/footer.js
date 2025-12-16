import React from 'react'
import cx from 'classnames'

import Link from '@components/link'
import Newsletter from '@components/newsletter'
import Icon from '@components/icon'
import BlockContent from '@components/block-content'

const Footer = ({ data }) => {
  const { disclaimer, menus, newsletter } = data
  return (
    <footer className="w-full flex flex-col justify-between relative bg-pink text-white px-25 py-40">
      <div className="grid-standard">
        <div className="col-span-5">
          <div className="w-[28rem]">
            <Icon name="Logo" viewBox="0 0 543 265" />
          </div>
        </div>
        {menus?.map((item, index) => (
          <div
            key={index}
            className="hidden md:flex flex-col gap-10 col-span-2 pb-30"
          >
            <div className="flex flex-col gap-5">
              {item.items?.map((link, index) => (
                <Link key={index} link={link} className={`btn-text`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      

      <div className="grid-standard items-start mt-100">
        <div className="col-span-5">
          <div className="flex gap-15">
            <div className="flex justify-start">
              © {new Date().getFullYear()} Julie Products Inc
            </div>
            <a
              href={`https://xkm.studio`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Site Credit
            </a>
          </div>
          {disclaimer && (
            <div className="flex justify-start text-12 mt-10">
              <div className="w-full max-w-[45rem]">
                <BlockContent blocks={disclaimer} />
              </div>
            </div>
          )}
        </div>
        <div className="hidden md:block col-span-3 md:col-span-7">
          <Newsletter newsletter={newsletter} />
        </div>
      </div>
    </footer>
  )
}

export default Footer
