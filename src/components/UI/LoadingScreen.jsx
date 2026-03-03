import { motion } from 'framer-motion'
import { Headphones } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-cosmic-900 flex items-center justify-center z-50">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-neon-purple/20 via-transparent to-transparent" />
      
      {/* Loading Content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full border-2 border-neon-purple/30"
            style={{
              borderTopColor: '#a855f7',
              borderRightColor: '#ec4899'
            }}
          />
          
          {/* Inner Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <Headphones className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          {/* Pulse Effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-neon-purple/50"
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold gradient-text mb-2">SoundVerse</h2>
          <p className="text-gray-400 text-sm">Loading your audio universe...</p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-48 h-1 bg-white/10 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-neon-purple to-neon-pink"
          />
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neon-purple/50"
            initial={{ 
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingScreen