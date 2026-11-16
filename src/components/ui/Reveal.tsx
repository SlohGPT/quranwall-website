import type { ReactNode } from 'react';
import { motion, MotionConfig } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

// Gentle fade-up, once. MotionConfig reducedMotion="user" drops the transform for people who ask for less
// motion (opacity still fades), so the first render is identical on server and client.
export default function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
