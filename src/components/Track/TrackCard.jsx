import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { useAuth } from '../../context/AuthContext'
import { favoritesApi } from '../../lib/supabase'

const TrackCard = ({ track, rank, onPlay }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isCurrentTrack = currentTrack?.id === track.id

  // Get energy color based on BPM
  const getEnergyColor = (bpm) => {
    if (!bpm) return '#a855f7'
    if (bpm < 90) return '#4ade80'
    if (bpm < 120) return '#60a5fa'
    if (bpm < 150) return '#f472b6'
    return '#fb923c'
  }

  const energyColor = getEnergyColor(track.bpm)

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      togglePlay()
    } else {
      onPlay?.()
    }
  }

  const toggleFavorite = async (e) => {
    e.stopPropagation()
    if (!user || !track) return
    
    if (isFavorite) {
      await favoritesApi.remove(user.id, track.id)
    } else {
      await favoritesApi.add(user.id, track.id)
    }
    setIsFavorite(!isFavorite)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      <div className="glass rounded-xl overflow-hidden transition-all duration-300 group-hover:border-opacity-50">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${energyColor}, ${energyColor}66)` 
              }}
            >
              <span className="text-4xl font-bold text-white/80">
                {track.title?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${energyColor}, ${energyColor}cc)` }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          </motion.button>

          {/* Rank Badge */}
          {rank && (
            <div 
              className="absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: `${energyColor}cc` }}
            >
              {rank}
            </div>
          )}

          {/* Energy Indicator */}
          {track.bpm && (
            <div 
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium"
              style={{ background: `${energyColor}40`, color: energyColor }}
            >
              {track.bpm} BPM
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-white truncate group-hover:text-neon-purple transition-colors">
            {track.title}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {track.artist}
          </p>
          
          {/* Realm Tag */}
          {track.realm && (
            <div className="mt-2 flex items-center gap-2">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${energyColor}20`, color: energyColor }}
              >
                {track.realm}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Show on Hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {user && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleFavorite}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-neon-pink fill-current' : 'text-white'
              }`} 
            />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default TrackCard