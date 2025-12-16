import React, { useEffect, useRef, useState } from 'react'

import Icon from '@components/icon'

const Drawer = ({
  prev,
  next,
  scrollProgress,
  className
}) => {
  return (
    <div className={`${className} text-black`}>
      <button
        onClick={prev}
        className="w-[1.8rem] px-5 flex items-center justify-center rotate-180 transition-colors duration-300 md:hover:text-black"
      >
        <Icon name="Arrow Tip" viewBox="0 0 5 9" />
      </button>
      <div className="w-full flex h-[.1rem] relative bg-cement">
        <div
          className="absolute left-0 top-0 bg-smoke w-full h-[.1rem] origin-left"
          style={{ transform: `scaleX(${scrollProgress})` }}
        ></div>
      </div>
      <button
        onClick={next}
        className="w-[1.8rem] px-5 flex items-center justify-center transition-colors duration-300 md:hover:text-black"
      >
        <Icon name="Arrow Tip" viewBox="0 0 5 9" />
      </button>
    </div>
  )
}

export default Drawer
