import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Play } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import { tracksApi } from '../lib/supabase'
import TrackCard from '../components/Track/TrackCard'

const MoodUniverse = () => {
  const { playTrack } = usePlayer()
  const { getMoodColor } = useTheme()
  
  const [selectedMood, setSelectedMood] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)

  const moods = [
    { id: 'happy', name: 'Happy', icon: '😊', color: '#fbbf24', description: 'Uplifting and joyful sounds' },
    { id: 'sad', name: 'Melancholic', icon: '😢', color: '#3b82f6', description: 'Emotional and reflective' },
    { id: 'energetic', name: 'Energetic', icon: '⚡', color: '#f97316', description: 'High energy and motivation' },
    { id: 'calm', name: 'Peaceful', icon: '🧘', color: '#10b981', description: 'Relaxing and meditative' },
    { id: 'romantic', name: 'Romantic', icon: '💕', color: '#ec4899', description: 'Love and intimacy' },
    { id: 'dreamy', name: 'Dreamy', icon: '✨', color: '#a855f7', description: 'Ethereal and atmospheric' },
    { id: 'focused', name: 'Focused', icon: '🎯', color: '#14b8a6', description: 'Concentration and productivity' },
    { id: 'dark', name: 'Dark', icon: '🌙', color: '#64748b', description: 'Moody and intense' }
  ]

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood)
    setLoading(true)
    
    try {
      // In a real app, this would filter by mood tags
      const { data } = await tracksApi.getAll({ limit: 20 })
      setTracks(data || [])
    } catch (error) {
      console.error('Error fetching mood tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-neon-purple" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Mood Universe</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select your current mood and let the music match your emotions
          </p>
        </motion.div>

        {/* Mood Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {moods.map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(mood)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                selectedMood?.id === mood.id ? 'ring-2' : ''
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${mood.color}20, ${mood.color}05)`,
                borderColor: selectedMood?.id === mood.id ? mood.color : 'transparent',
                ringColor: mood.color
              }}
            >
              {selectedMood?.id === mood.id && (
                <motion.div
                  layoutId="moodSelector"
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${mood.color}30, transparent)`,
                    border: `2px solid ${mood.color}`
                  }}
                />
              )}

              <div className="relative z-10 text-center">
                <span className="text-4xl mb-3 block">{mood.icon}</span>
                <h3 className="text-lg font-bold mb-1">{mood.name}</h3>
                <p className="text-xs text-gray-400">{mood.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Mood Info */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
            style={{ borderColor: `${selectedMood.color}40` }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: `linear-gradient(135deg, ${selectedMood.color}40, ${selectedMood.color}20)` }}
              >
                {selectedMood.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedMood.name} Mood</h2>
                <p className="text-gray-400">{selectedMood.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tracks */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader" />
          </div>
        ) : tracks.length > 0 && selectedMood ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard 
                  track={track}
                  onPlay={() => playTrack(track, tracks)}
                />
              </motion.div>
            ))}
          </div>
        ) : selectedMood ? (
          <div className="text-center py-12 text-gray-400">
            <p>No tracks found for this mood</p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a mood to discover matching tracks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoodUniverse