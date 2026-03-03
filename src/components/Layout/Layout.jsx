import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingNav from './FloatingNav'
import MiniPlayer from '../Player/MiniPlayer'
import ParticleBackground from '../Effects/ParticleBackground'
import { usePlayer } from '../../context/PlayerContext'
import { useTheme } from '../../context/ThemeContext'

const Layout = () => {
  const location = useLocation()
  const { currentTrack, isPlaying } = usePlayer()
  const { dynamicBackground, getRealmTheme, currentTheme } = useTheme()
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)

  useEffect(() => {
    if (currentTrack) {
      setShowMiniPlayer(true)
    }
  }, [currentTrack])

  // Get theme colors for dynamic background
  const theme = getRealmTheme(currentTheme)

  return (
    <div className="min-h-screen bg-cosmic-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 transition-all duration-1000 ease-out"
        style={dynamicBackground?.background ? {
          background: dynamicBackground.background
        } : {
          background: `radial-gradient(ellipse at 50% 0%, ${theme.primary}15 0%, transparent 50%)`
        }}
      />
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-cosmic-900/50 to-cosmic-900 pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Floating Navigation */}
        <FloatingNav />
        
        {/* Page Content with Transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`pb-24 ${showMiniPlayer && currentTrack ? 'pb-32' : ''}`}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        
        {/* Mini Player */}
        <AnimatePresence>
          {showMiniPlayer && currentTrack && (
            <MiniPlayer />
          )}
        </AnimatePresence>
      </div>
      
      {/* Ambient Glow Effect */}
      {isPlaying && currentTrack && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `linear-gradient(to top, ${theme.primary}20, transparent)`
          }}
        />
      )}
    </div>
  )
}

export default Layout