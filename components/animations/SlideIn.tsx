'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
  from?: 'left' | 'right' | 'top' | 'bottom'
}

export function SlideIn({
  children,
  delay = 0,
  duration = 0.4,
  from = 'left',
  ...props
}: SlideInProps) {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    top: { y: -100 },
    bottom: { y: 100 },
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[from],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
