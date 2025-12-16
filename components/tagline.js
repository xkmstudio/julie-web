// components/AnimatedText.js
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useSceneLoaded } from '@lib/context'

const AnimatedText = ({ time, className, loop = true }) => {
  const [visible, setVisible] = useState(0)
  const setSceneLoaded = useSceneLoaded()

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => {
        if (!loop && prev === 1) {
          clearInterval(interval)
          setSceneLoaded(true)
          
          return prev
        }
        return prev === 0 ? 1 : 0
      })
    }, time || 4000)

    return () => clearInterval(interval)
  }, [loop, time])

  const variants = {
    hidden: { opacity: 0, y: 10, transition: { duration: 0.5 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.5 } },
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {visible === 0 ? (
          <motion.div
            key="first"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
          >
            A Comprehensive Creative Company
          </motion.div>
        ) : (
          <motion.div
            key="second"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
          >
            Operating Between the Physical and Digital
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnimatedText
