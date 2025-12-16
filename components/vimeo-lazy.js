import React, { useRef, useState, useEffect } from 'react';
import Player from '@vimeo/player';
import { useIntersection } from 'use-intersection';
import cx from 'classnames';

const VimeoLoop = ({
  title,
  id,
  className,
  ...rest
}) => {
  if (!id) return null;

  const containerRef = useRef();
  const videoRef = useRef();
  const [iframePlayer, setIframePlayer] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 });
  const isIntersecting = useIntersection(containerRef);

  useEffect(() => {
    if (videoRef.current && iframePlayer === null) {
      const player = new Player(videoRef.current);
      setIframePlayer(player);

      // Fetch video dimensions from Vimeo API
      player.getVideoWidth().then((videoWidth) => {
        player.getVideoHeight().then((videoHeight) => {
          setVideoDimensions({ width: videoWidth, height: videoHeight });
        });
      }).catch((error) => console.error('Error fetching video dimensions:', error));
    }
  }, [videoRef.current]);

  useEffect(() => {
    if (iframePlayer) {
      if (isIntersecting) {
        iframePlayer.play().catch(() => {});
      } else {
        iframePlayer.pause();
      }
    }
  }, [iframePlayer, isIntersecting]);

  return (
    <div
      ref={containerRef}
      className={cx('video-loop', className, 'relative w-full h-full')}
      {...rest}
    >
      <div className="video-container relative w-full h-full">
        <iframe
          ref={videoRef}
          title={title}
          src={`https://player.vimeo.com/video/${id}?background=1&autoplay=1&autopause=0&loop=1`}
          frameBorder="0"
          allow="autoplay; fullscreen"
          className="absolute top-0 left-0 w-full h-full object-contain"
        ></iframe>
      </div>
    </div>
  );
};

export default VimeoLoop;
