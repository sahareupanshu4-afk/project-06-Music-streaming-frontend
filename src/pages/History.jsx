import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Play, Trash2, Music } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { supabase } from '../lib/supabase'

const History = () => {
  const { user } = useAuth()
  const { playTrack } = usePlayer()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set loading to false immediately if no user
    if (!user) {
      setLoading(false)
      return
    }
    
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('recently_played')
        .select(`
          id,
          last_position,
          played_at,
          energy_snapshot,
          track_id,
          tracks (
            id,
            title,
            artist,
            album,
            duration,
            bpm,
            energy_level,
            realm,
            audio_url,
            cover_url
          )
        `)
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching history:', error)
        setHistory([])
      } else {
        setHistory(data || [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('recently_played')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const removeFromHistory = async (trackId) => {
    try {
      const { error } = await supabase
        .from('recently_played')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId)

      if (error) throw error
      setHistory(prev => prev.filter(item => item.track_id !== trackId))
    } catch (error) {
      console.error('Error removing from history:', error)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      if (hours === 0) {
        const mins = Math.floor(diff / 60000)
        return mins <= 1 ? 'Just now' : `${mins} minutes ago`
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return days === 1 ? 'Yesterday' : `${days} days ago`
    }
    
    // Default format
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handlePlayTrack = (item) => {
    if (item.tracks) {
      playTrack(item.tracks, history.map(h => h.tracks).filter(Boolean))
    }
  }

  // Group history by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.played_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cosmic-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-neon-purple" />
              <h1 className="text-2xl font-bold">Listening History</h1>
            </div>
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Clear All
              </motion.button>
            )}
          </div>
          <p className="text-gray-400 mt-1">
            {history.length} {history.length === 1 ? 'track' : 'tracks'} played
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Music className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No listening history yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Start playing some music and your recently played tracks will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  {date === new Date().toDateString() ? 'Today' : 
                   date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 
                   new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      {/* Cover Art */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {item.tracks?.cover_url ? (
                          <img 
                            src={item.tracks.cover_url} 
                            alt={item.tracks.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePlayTrack(item)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Play className="w-5 h-5 text-white" fill="white" />
                        </motion.button>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.tracks?.title || 'Unknown Track'}</h3>
                        <p className="text-sm text-gray-400 truncate">
                          {item.tracks?.artist || 'Unknown Artist'}
                          {item.tracks?.album && ` • ${item.tracks.album}`}
                        </p>
                      </div>

                      {/* Energy Badge */}
                      {item.energy_snapshot && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.energy_snapshot === 'calm' ? 'bg-green-500/20 text-green-400' :
                          item.energy_snapshot === 'flow' ? 'bg-blue-500/20 text-blue-400' :
                          item.energy_snapshot === 'drive' ? 'bg-pink-500/20 text-pink-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {item.energy_snapshot}
                        </span>
                      )}

                      {/* Duration */}
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {item.tracks?.duration ? formatDuration(item.tracks.duration) : '--:--'}
                      </span>

                      {/* Played At */}
                      <span className="text-xs text-gray-500 w-24 text-right">
                        {formatDate(item.played_at)}
                      </span>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromHistory(item.track_id)}
                        className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History