import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  Maximize2,
  Heart,
  ListMusic
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { useAuth } from '../../context/AuthContext'
import { favoritesApi } from '../../lib/supabase'
import AudioVisualizer from './AudioVisualizer'

const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    changeVolume,
    toggleMute,
    seek,
    setIsFullscreen,
    getEnergyLevel,
    audioData
  } = usePlayer()
  
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const progressRef = useRef(null)

  // Check if track is favorite
  useEffect(() => {
    const checkFavorite = async () => {
      if (user && currentTrack) {
        const result = await favoritesApi.isFavorite(user.id, currentTrack.id)
        setIsFavorite(result)
      }
    }
    checkFavorite()
  }, [user, currentTrack])

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get track duration - use audio duration or fallback to track duration
  const trackDuration = duration && isFinite(duration) ? duration : (currentTrack?.duration || 0)
  
  // Calculate progress percentage
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0

// Handle progress bar click
  const handleProgressClick = (e) => {
    if (!progressRef.current || !trackDuration) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * trackDuration)
  }

  // Handle progress bar drag
  const handleProgressDrag = (e) => {
    if (!progressRef.current || !trackDuration) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    seek(percentage * trackDuration)
  }

  // Handle progress bar mouse down
  const handleProgressMouseDown = (e) => {
    e.preventDefault()
    handleProgressDrag(e)
    document.addEventListener('mousemove', handleProgressDrag)
    document.addEventListener('mouseup', handleProgressMouseUp)
  }

  // Handle progress bar mouse up
  const handleProgressMouseUp = () => {
    document.removeEventListener('mousemove', handleProgressDrag)
    document.removeEventListener('mouseup', handleProgressMouseUp)
  }

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!user || !currentTrack) return
    
    if (isFavorite) {
      await favoritesApi.remove(user.id, currentTrack.id)
    } else {
      await favoritesApi.add(user.id, currentTrack.id)
    }
    setIsFavorite(!isFavorite)
  }

  // Get energy color
  const energyColor = {
    calm: '#4ade80',
    flow: '#60a5fa',
    drive: '#f472b6',
    hyper: '#fb923c'
  }[getEnergyLevel(currentTrack?.bpm)] || '#a855f7'

  if (!currentTrack) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[calc(100%-2rem)] md:max-w-2xl z-40"
    >
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        {/* Progress Bar */}
<div 
          ref={progressRef}
          className="h-1 bg-white/10 cursor-pointer group"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
        >
          <motion.div
            className="h-full relative"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${energyColor}, ${energyColor}aa)`
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        <div className="p-3 flex items-center gap-3">
          {/* Track Info & Cover */}
          <Link 
            to="/player"
            className="flex items-center gap-3 flex-1 min-w-0 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
            >
              {currentTrack.cover_url ? (
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${energyColor}, ${energyColor}66)` }}
                >
                  <span className="text-white text-lg font-bold">
                    {currentTrack.title?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Playing Animation Overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <AudioVisualizer 
                    frequencyData={audioData.frequencyData} 
                    size="small" 
                  />
                </div>
              )}
            </motion.div>

            <div className="min-w-0">
              <motion.h4 
                className="text-sm font-medium text-white truncate group-hover:text-neon-purple transition-colors"
                layoutId={`track-title-${currentTrack.id}`}
              >
                {currentTrack.title}
              </motion.h4>
              <p className="text-xs text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Favorite Button */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? 'text-neon-pink fill-current' : 'text-gray-400'
                  }`} 
                />
              </motion.button>
            )}

            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousTrack}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <SkipBack className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="p-3 rounded-full transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${energyColor}, ${energyColor}cc)`,
                boxShadow: `0 0 20px ${energyColor}40`
              }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTrack}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <SkipForward className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.button>

            {/* Volume Control */}
            <div 
              className="relative hidden sm:block"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-400" />
                )}
              </motion.button>

              {/* Volume Slider */}
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 glass rounded-lg"
                  >
                    <div className="h-24 w-2 bg-white/10 rounded-full relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 rounded-full"
                        style={{ 
                          height: `${(isMuted ? 0 : volume) * 100}%`,
                          background: `linear-gradient(to top, ${energyColor}, ${energyColor}66)`
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => changeVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Queue Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
            >
              <ListMusic className="w-5 h-5 text-gray-400" />
            </motion.button>

            {/* Fullscreen Button */}
            <Link to="/player">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-gray-400" />
              </motion.button>
            </Link>
          </div>

          {/* Time Display */}
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(trackDuration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MiniPlayer