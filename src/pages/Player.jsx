import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Minimize2,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { favoritesApi } from '../lib/supabase'
import { CircularVisualizer, WaveformVisualizer } from '../components/Player/AudioVisualizer'

const Player = () => {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    audioData,
    togglePlay,
    nextTrack,
    previousTrack,
    changeVolume,
    toggleMute,
    seek,
    toggleShuffle,
    toggleRepeat,
    getEnergyLevel
  } = usePlayer()
  
  const { user } = useAuth()
  const { getRealmTheme, setDynamicBackgroundFromColor } = useTheme()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const progressRef = useRef(null)

  // Get theme based on track realm
  const theme = currentTrack?.realm ? getRealmTheme(currentTrack.realm) : getRealmTheme('electronic')
  const energyLevel = getEnergyLevel(currentTrack?.bpm)
  const energyColor = {
    calm: '#4ade80',
    flow: '#60a5fa',
    drive: '#f472b6',
    hyper: '#fb923c'
  }[energyLevel] || '#a855f7'

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

  // Set dynamic background based on track
  useEffect(() => {
    if (currentTrack) {
      setDynamicBackgroundFromColor(theme.primary)
    }
  }, [currentTrack, theme.primary, setDynamicBackgroundFromColor])

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get track duration - use audio duration or fallback to track duration
  const trackDuration = duration && isFinite(duration) ? duration : (currentTrack?.duration || 0)
  
  // Calculate progress
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!progressRef.current || !trackDuration) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * trackDuration)
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

  if (!currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Track Playing</h2>
          <p className="text-gray-400 mb-6">Select a track to start listening</p>
          <Link to="/" className="btn-primary">
            Browse Music
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen pt-20 pb-32 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${theme.primary}20 0%, transparent 50%)`
      }}
    >
      {/* Background Blur Circles */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: theme.primary }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: theme.secondary }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
          {/* Left Side - Album Art & Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Album Art Container */}
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl blur-2xl"
                style={{ background: theme.gradient }}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Album Art */}
              <motion.div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ borderRadius: '50%' }}
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
                    style={{ background: theme.gradient }}
                  >
                    <span className="text-8xl font-bold text-white/80">
                      {currentTrack.title?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Circular Visualizer */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <CircularVisualizer 
                    frequencyData={audioData.frequencyData}
                    size={400}
                    color={theme.primary}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Side - Track Info & Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Track Info */}
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ background: `${energyColor}30`, color: energyColor }}
              >
                {energyLevel.toUpperCase()} • {currentTrack.bpm || '---'} BPM
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {currentTrack.title}
              </h1>
              <p className="text-xl text-gray-400 mb-4">
                {currentTrack.artist}
              </p>
              
              {currentTrack.realm && (
                <span 
                  className="inline-block px-4 py-1 rounded-full text-sm"
                  style={{ background: `${theme.primary}20`, color: theme.primary }}
                >
                  {currentTrack.realm}
                </span>
              )}
            </div>

            {/* Waveform Visualizer */}
            <div className="hidden md:block">
              <WaveformVisualizer 
                waveformData={audioData.waveformData}
                width={500}
                height={80}
                color={theme.primary}
              />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div 
                ref={progressRef}
                className="h-2 bg-white/10 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
              >
                <motion.div
                  className="h-full rounded-full relative"
                  style={{ 
                    width: `${progress}%`,
                    background: theme.gradient
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </motion.div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(trackDuration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Shuffle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleShuffle}
                className={`p-3 rounded-full transition-colors ${
                  shuffle ? 'text-neon-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>

              {/* Previous */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={previousTrack}
                className="p-3 rounded-full hover:bg-white/5 text-white"
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>

              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="p-6 rounded-full transition-all"
                style={{ 
                  background: theme.gradient,
                  boxShadow: `0 0 40px ${theme.primary}40`
                }}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </motion.button>

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTrack}
                className="p-3 rounded-full hover:bg-white/5 text-white"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>

              {/* Repeat */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRepeat}
                className={`p-3 rounded-full transition-colors ${
                  repeat !== 'none' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center gap-6">
              {/* Favorite */}
              {user && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'text-neon-pink' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </motion.button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="p-2 rounded-full text-gray-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${theme.primary} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
                  }}
                />
              </div>

              {/* Queue */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQueue(!showQueue)}
                className="p-2 rounded-full text-gray-400 hover:text-white"
              >
                <ListMusic className="w-5 h-5" />
              </motion.button>

              {/* Share */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full text-gray-400 hover:text-white"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>

              {/* Minimize */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-full text-gray-400 hover:text-white"
              >
                <Minimize2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Player