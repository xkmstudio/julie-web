import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useIntersection } from 'use-intersection'
import cx from 'classnames'
import Icon from '@components/icon'
import { AnimatePresence, m, useAnimationControls } from 'framer-motion'

// Helper function to convert MM:SS to seconds
const timestampToSeconds = (timestamp) => {
  if (!timestamp) return 0
  const parts = timestamp.split(':')
  if (parts.length !== 2) return 0
  const [minutes, seconds] = parts.map(Number)
  if (isNaN(minutes) || isNaN(seconds)) return 0
  return minutes * 60 + seconds
}

// Helper function to convert seconds to MM:SS
const secondsToTimestamp = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const VideoPlayer = ({
  src,
  className,
  poster,
  posterUrl,
  sections = [],
  layout = 'fill',
  autoplay = false,
}) => {
  if (!src) return null

  const videoRef = useRef(null)
  const inlineContainerRef = useRef(null)
  const fullscreenContainerRef = useRef(null)
  const progressBarRef = useRef()
  const isIntersecting = useIntersection(inlineContainerRef)

  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [videoElement, setVideoElement] = useState(null)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const closeButtonRef = useRef(null)
  const lastActiveElementRef = useRef(null)
  const playbackSnapshotRef = useRef({
    time: 0,
    wasPlaying: false,
    hasSnapshot: false,
  })

  const videoAnimationControls = useAnimationControls()

  const isFullscreenVisible = isFullscreen || isAnimating
  const [overlayTarget, setOverlayTarget] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const node = document.createElement('div')
    node.setAttribute('data-video-player-portal', '')
    document.body.appendChild(node)
    setOverlayTarget(node)

    return () => {
      document.body.removeChild(node)
      setOverlayTarget(null)
    }
  }, [])

  const setVideoRef = useCallback((node) => {
    if (node) {
      videoRef.current = node
      setVideoElement(node)
    } else {
      videoRef.current = null
      setVideoElement(null)
    }
  }, [])

  // Convert sections to seconds and sort them
  const sectionsInSeconds = sections
    .map((section, index) => ({
      ...section,
      seconds: timestampToSeconds(section.timestamp),
      index,
    }))
    .sort((a, b) => a.seconds - b.seconds)

  // Find current section based on current time
  useEffect(() => {
    if (sectionsInSeconds.length === 0) {
      setCurrentSectionIndex(0)
      return
    }

    // Find the section that the current time falls into
    let foundIndex = -1
    for (let i = sectionsInSeconds.length - 1; i >= 0; i--) {
      if (currentTime >= sectionsInSeconds[i].seconds) {
        foundIndex = i
        break
      }
    }

    // If we're before the first section, use the first one
    if (foundIndex === -1 && sectionsInSeconds.length > 0) {
      foundIndex = 0
    }

    if (foundIndex !== -1 && foundIndex !== currentSectionIndex) {
      setCurrentSectionIndex(foundIndex)
    }
  }, [currentTime, sectionsInSeconds, currentSectionIndex])

  // Update current time and duration
  useEffect(() => {
    const video = videoElement
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)
    }

    const updateDuration = () => {
      if (video.duration) {
        setDuration(video.duration)
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('durationchange', updateDuration)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('durationchange', updateDuration)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [videoElement])

  // Handle video loaded
  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setHasLoaded(true)
    }
  }, [])

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!videoElement) return

    if (videoElement.paused) {
      videoElement.play().catch(() => {})
      setIsPlaying(true)
    } else {
      videoElement.pause()
      setIsPlaying(false)
    }
  }, [videoElement])

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleEnterFullscreen = useCallback(() => {
    if (isFullscreenVisible) return

    if (videoElement) {
      playbackSnapshotRef.current = {
        time: videoElement.currentTime,
        wasPlaying: !videoElement.paused,
        hasSnapshot: true,
      }
      setIsPlaying(!videoElement.paused)
    } else {
      playbackSnapshotRef.current.hasSnapshot = false
    }

    if (typeof document !== 'undefined') {
      lastActiveElementRef.current = document.activeElement
    }

    setIsAnimating(true)
    setIsFullscreen(true)
    setShowControls(true)
  }, [isFullscreenVisible, videoElement])

  const closeFullscreen = useCallback(() => {
    if (!isFullscreenVisible) return

    if (videoElement) {
      playbackSnapshotRef.current = {
        time: videoElement.currentTime,
        wasPlaying: !videoElement.paused,
        hasSnapshot: true,
      }
      setIsPlaying(!videoElement.paused)
    } else {
      playbackSnapshotRef.current.hasSnapshot = false
    }

    setIsAnimating(true)
    setIsFullscreen(false)
  }, [isFullscreenVisible, videoElement])

  // Handle section navigation
  const navigateToSection = useCallback(
    (direction) => {
      if (sectionsInSeconds.length === 0) return

      let newIndex = currentSectionIndex
      if (direction === 'next') {
        newIndex = Math.min(
          currentSectionIndex + 1,
          sectionsInSeconds.length - 1
        )
      } else {
        newIndex = Math.max(currentSectionIndex - 1, 0)
      }

      if (videoElement && sectionsInSeconds[newIndex]) {
        videoElement.currentTime = sectionsInSeconds[newIndex].seconds
        setCurrentSectionIndex(newIndex)
      }
    },
    [currentSectionIndex, sectionsInSeconds, videoElement]
  )

  // Handle progress bar click
  const handleProgressClick = useCallback(
    (e) => {
      if (!progressBarRef.current || !videoElement) return

      const rect = progressBarRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration

      videoElement.currentTime = newTime
      setCurrentTime(newTime)
    },
    [duration, videoElement]
  )

  // Handle progress bar drag
  const handleProgressMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !progressBarRef.current || !videoElement) return
      handleProgressClick(e)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleProgressClick, videoElement])

  // Intersection observer for autoplay
  useEffect(() => {
    if (!videoElement) return
    if (isFullscreenVisible) return

    if (isIntersecting && autoplay) {
      videoElement.play().catch(() => {})
      setHasLoaded(true)
      setIsPlaying(true)
    } else if (!isIntersecting) {
      videoElement.pause()
      setIsPlaying(false)
    }
  }, [videoElement, isIntersecting, autoplay, isFullscreenVisible])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeContainer = isFullscreenVisible
        ? fullscreenContainerRef.current
        : inlineContainerRef.current

      if (!activeContainer?.contains(document.activeElement)) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateToSection('prev')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateToSection('next')
      } else if (e.key === ' ') {
        e.preventDefault()
        handlePlayPause()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigateToSection, handlePlayPause, isFullscreenVisible])

  useEffect(() => {
    if (!isAnimating) return

    let cancelled = false

    const animate = async () => {
      if (isFullscreen) {
        videoAnimationControls.set({ y: 10, opacity: 0 })
        await videoAnimationControls.start({
          y: 0,
          opacity: 1,
          transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
        })

        if (cancelled) return
        setIsAnimating(false)
        closeButtonRef.current?.focus?.()
      } else {
        await videoAnimationControls.start({
          y: 10,
          opacity: 0,
          transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
        })

        if (cancelled) return
        videoAnimationControls.set({ y: 0, opacity: 1 })
        setIsAnimating(false)
        lastActiveElementRef.current?.focus?.()
      }
    }

    animate()

    return () => {
      cancelled = true
      videoAnimationControls.stop()
    }
  }, [isAnimating, isFullscreen, videoAnimationControls])

  useEffect(() => {
    if (!videoElement) return
    videoElement.muted = isMuted
  }, [videoElement, isMuted])

  useEffect(() => {
    if (!videoElement) return
    if (!isFullscreenVisible && !playbackSnapshotRef.current.hasSnapshot) return

    const { time, wasPlaying } = playbackSnapshotRef.current

    if (!Number.isNaN(time) && time != null) {
      try {
        videoElement.currentTime = time
      } catch (error) {
        // ignore seek errors
      }
    }

    if (wasPlaying) {
      videoElement.play().catch(() => {})
      setIsPlaying(true)
    } else {
      videoElement.pause()
      setIsPlaying(false)
    }

    playbackSnapshotRef.current.hasSnapshot = false
  }, [videoElement, isFullscreenVisible])

  useEffect(() => {
    if (!isFullscreenVisible) return
    if (typeof document === 'undefined') return

    const { body } = document
    if (!body) return

    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isFullscreenVisible])

  useEffect(() => {
    if (!isFullscreenVisible) return
    if (typeof document === 'undefined') return

    const trapNode = fullscreenContainerRef.current
    if (!trapNode) return

    const selectorList = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const getFocusable = () =>
      Array.from(trapNode.querySelectorAll(selectorList)).filter(
        (element) =>
          element instanceof HTMLElement &&
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex !== -1
      )

    const focusableElements = getFocusable()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeFullscreen()
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusable()
      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !trapNode.contains(active)) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (active === last || !trapNode.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreenVisible, closeFullscreen, fullscreenContainerRef])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const currentSection = sectionsInSeconds[currentSectionIndex]

  const renderControls = (isFullscreenMode) => {
    const fullscreenStyles = isFullscreenMode
      ? {
          paddingLeft: 'clamp(1.5rem, 5vw, 3.75rem)',
          paddingRight: 'clamp(1.5rem, 5vw, 3.75rem)',
          paddingTop: '1.75rem',
          paddingBottom:
            'calc(max(2rem, env(safe-area-inset-bottom, 1.5rem)))',
        }
      : undefined

    const wrapperClassName = cx(
      'video-playbar',
      showControls ? 'opacity-100' : 'opacity-0',
      { 'absolute left-0 right-0 bottom-0': isFullscreenMode }
    )

    return (
      <div className={wrapperClassName} style={fullscreenStyles}>
        <div className="relative z-2 flex flex-1 items-center justify-between gap-10 text-white">
          <div>[</div>
          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div>]</div>
        </div>

        <div className="controls relative z-2">
          {sectionsInSeconds.length > 0 && currentSection && (
            <div className="section-navigation">
              <button
                onClick={() => navigateToSection('prev')}
                disabled={currentSectionIndex === 0}
                className="h-8 w-8"
                aria-label="Previous section"
              >
                <Icon
                  name="Arrow Tip"
                  viewBox="0 0 5 9"
                  className="rotate-180"
                />
              </button>

              <div className="section-title">{currentSection.title}</div>

              <button
                onClick={() => navigateToSection('next')}
                disabled={
                  currentSectionIndex === sectionsInSeconds.length - 1
                }
                className="h-8 w-8"
                aria-label="Next section"
              >
                <Icon name="Arrow Tip" viewBox="0 0 5 9" />
              </button>
            </div>
          )}

          <div className="control-group ml-15">
            <button
              onClick={handlePlayPause}
              className="h-8 w-8"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Icon name="Pause Video" viewBox="0 0 330 429" />
              ) : (
                <Icon name="Play Video" viewBox="0 0 372 429" />
              )}
            </button>

            <button
              onClick={handleMuteToggle}
              className="h-8 w-12"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <Icon name="Muted" viewBox="0 0 466 429" />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2">
                  <Icon name="Unmuted" viewBox="0 0 305 429" />
                </div>
              )}
            </button>

            {!isFullscreenMode && (
              <button
                onClick={handleEnterFullscreen}
                className="h-8 w-8"
                aria-label="Enter fullscreen"
              >
                <Icon name="Expand" viewBox="0 0 12 11" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderVideo = (isFullscreenMode) => (
    <m.div
      className={cx('relative z-[1] flex w-full flex-col', {
        'pointer-events-auto': isFullscreenMode,
      })}
      style={isFullscreenMode ? { maxWidth: 'calc(100vw)' } : undefined}
      animate={isFullscreenMode ? videoAnimationControls : undefined}
      initial={false}
    >
      <video
        ref={setVideoRef}
        onLoadedData={handleVideoLoaded}
        onLoadedMetadata={handleVideoLoaded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        src={hasLoaded ? src : null}
        className={
          isFullscreenMode ? 'w-full h-auto object-contain' : className || 'w-full'
        }
        style={isFullscreenMode ? { maxHeight: '90vh' } : undefined}
        autoPlay={autoplay}
        loop={autoplay}
        muted={isMuted}
        playsInline
        poster={posterUrl}
      />
      {!isFullscreenMode && renderControls(false)}
    </m.div>
  )

  const inlinePlayer = (
    <div
      ref={inlineContainerRef}
      className={cx(
        'video-player group relative',
        className,
        {
          'w-full h-[auto]': layout === 'intrinsic',
          'h-full w-[auto]': layout === 'height',
          'w-full md:h-full md:object-cover md:absolute md:left-0 md:top-0 h-[auto]':
            layout === 'thumb',
          'h-full w-full object-cover absolute left-0 top-0':
            layout === 'fill',
        }
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
    >
      {renderVideo(false)}
    </div>
  )

  const overlayPlayer =
    overlayTarget && isFullscreenVisible
      ? createPortal(
          <AnimatePresence>
            {isFullscreenVisible && (
              <m.div
                key="video-player-overlay"
                ref={fullscreenContainerRef}
                className="group fixed inset-0 z-[1000] flex items-center justify-center"
                data-focus-trap="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(true)}
              >
                <div className="absolute inset-0 -z-10 bg-black/80" />

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeFullscreen}
                  className="absolute top-6 right-6 z-[5] flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white"
                  aria-label="Exit fullscreen"
                >
                  <Icon name="Close" viewBox="0 0 22 22" />
                </button>

                <div className="video-player group relative flex h-full w-full items-center justify-center">
                  {renderVideo(true)}
                  {renderControls(true)}
                </div>
              </m.div>
            )}
          </AnimatePresence>,
          overlayTarget
        )
      : null

  return (
    <>
      {!isFullscreenVisible && inlinePlayer}
      {overlayPlayer}
    </>
  )
}

export default VideoPlayer
