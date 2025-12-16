import React, { useRef, useState, useEffect } from 'react';
import { useIntersection } from 'use-intersection';
import cx from 'classnames';

const VideoLoop = ({
  title,
  id,
  width = 1440,
  height = 900,
  className,
  contain,
  poster,
  ...rest
}) => {
  if (!id) return null;  

  const videoRef = useRef();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const isIntersecting = useIntersection(videoRef);

  // Wait until the entire page is fully loaded before setting `pageLoaded`
  useEffect(() => {
    window.onload = () => setPageLoaded(true);
  }, []);

  // Load video only when it's visible AND the page has fully loaded
  useEffect(() => {
    if (isIntersecting) {
      videoRef.current.play().catch(() => {});
      setHasLoaded(true);
    } else {
      videoRef.current.pause();
    }
  }, [isIntersecting, pageLoaded]);

  return (
    <div className={cx('video-loop', className)} {...rest}>
      <video
        ref={videoRef}
        poster={poster}
        src={hasLoaded ? id : null} // Only load the src when necessary
        className={`w-full h-full${
          contain ? ' object-contain' : ' object-cover absolute top-0 left-0'
        }`}
        autoPlay
        loop
        muted
        playsInline
      ></video>
    </div>
  );
};

export default VideoLoop;
