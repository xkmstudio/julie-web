import React, { useState, useEffect, useRef } from 'react'

// Component that loads a video file and extracts its duration
const VideoDuration = ({ videoUrl, onDurationLoaded, className }) => {
  const [duration, setDuration] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoUrl) return

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = videoUrl

    const handleLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration)
        if (onDurationLoaded) {
          onDurationLoaded(video.duration)
        }
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.src = ''
    }
  }, [videoUrl, onDurationLoaded])

  if (!duration) return null

  return (
    <span className={className}>
      {formatDuration(duration)}
    </span>
  )
}

// Helper function to format duration in seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds || !isFinite(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins} Min : ${secs.toString().padStart(2, '0')} Sec`
}

export default VideoDuration
export { formatDuration }

