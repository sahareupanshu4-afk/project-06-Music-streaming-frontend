import { motion } from 'framer-motion'
import { Music } from 'lucide-react'

const RealmSphere = ({ realm }) => {
  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Sphere Container */}
      <div className="relative aspect-square">
        {/* Outer Glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ background: realm.color }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Sphere */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            background: `radial-gradient(circle at 30% 30%, 
              ${realm.color}ee, 
              ${realm.color}aa 40%, 
              ${realm.color}44 60%, 
              transparent 70%)`,
            boxShadow: `
              inset -15px -15px 30px rgba(0, 0, 0, 0.5),
              inset 10px 10px 30px rgba(255, 255, 255, 0.1),
              0 0 40px ${realm.color}40
            `
          }}
        >
          {/* Inner Highlight */}
          <div 
            className="absolute top-4 left-4 w-1/3 h-1/3 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)`
            }}
          />

          {/* Realm Icon/Initial */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/80">
              {realm.name.charAt(0)}
            </span>
          </div>

          {/* Orbiting Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                background: realm.color,
                top: '50%',
                left: '50%'
              }}
              animate={{
                x: [
                  Math.cos((i * Math.PI * 2) / 3) * 40,
                  Math.cos((i * Math.PI * 2) / 3 + Math.PI) * 40,
                  Math.cos((i * Math.PI * 2) / 3) * 40
                ],
                y: [
                  Math.sin((i * Math.PI * 2) / 3) * 40,
                  Math.sin((i * Math.PI * 2) / 3 + Math.PI) * 40,
                  Math.sin((i * Math.PI * 2) / 3) * 40
                ],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: realm.color }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      </div>

      {/* Realm Info */}
      <div className="mt-4 text-center">
        <h3 className="font-semibold text-white group-hover:text-neon-purple transition-colors">
          {realm.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {realm.tracks} tracks
        </p>
      </div>
    </motion.div>
  )
}

export default RealmSphere