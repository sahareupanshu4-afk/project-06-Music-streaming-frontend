import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Play, Pause } from 'lucide-react'
import { tracksApi } from '../lib/supabase'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import TrackCard from '../components/Track/TrackCard'

const EnergyWave = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay, getEnergyLevel } = usePlayer()
  const { getEnergyColor } = useTheme()
  
  const [selectedEnergy, setSelectedEnergy] = useState('flow')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  const energyLevels = [
    { 
      id: 'calm', 
      name: 'Calm', 
      bpm: '0-90', 
      color: '#4ade80',
      icon: '🌊',
      description: 'Peaceful and relaxing sounds for meditation and focus'
    },
    { 
      id: 'flow', 
      name: 'Flow', 
      bpm: '90-120', 
      color: '#60a5fa',
      icon: '🎵',
      description: 'Balanced rhythms for work and creative activities'
    },
    { 
      id: 'drive', 
      name: 'Drive', 
      bpm: '120-150', 
      color: '#f472b6',
      icon: '⚡',
      description: 'Energetic beats for exercise and motivation'
    },
    { 
      id: 'hyper', 
      name: 'Hyper', 
      bpm: '150+', 
      color: '#fb923c',
      icon: '🔥',
      description: 'Maximum energy for intense workouts and parties'
    }
  ]

  useEffect(() => {
    fetchTracks()
  }, [selectedEnergy])

  const fetchTracks = async () => {
    setLoading(true)
    try {
      const { data } = await tracksApi.getByEnergy(selectedEnergy)
      setTracks(data || [])
    } catch (error) {
      console.error('Error fetching energy tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentEnergy = energyLevels.find(e => e.id === selectedEnergy)

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
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Zap className="w-12 h-12 text-energy-flow" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Energy Waves</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find your perfect energy level. Music organized by tempo to match your activity and mood.
          </p>
        </motion.div>

        {/* Energy Level Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {energyLevels.map((energy, index) => (
            <motion.div
              key={energy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedEnergy(energy.id)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                selectedEnergy === energy.id 
                  ? 'ring-2' 
                  : 'hover:ring-1'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${energy.color}20, ${energy.color}05)`,
                borderColor: selectedEnergy === energy.id ? energy.color : 'transparent',
                ringColor: energy.color
              }}
            >
              {/* Selection Indicator */}
              {selectedEnergy === energy.id && (
                <motion.div
                  layoutId="energySelector"
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${energy.color}30, transparent)`,
                    border: `2px solid ${energy.color}`
                  }}
                  transition={{ type: 'spring', bounce: 0.2 }}
                />
              )}

              <div className="relative z-10">
                <span className="text-4xl mb-3 block">{energy.icon}</span>
                <h3 className="text-xl font-bold mb-1">{energy.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{energy.bpm} BPM</p>
                <div 
                  className="h-1 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${energy.color}, ${energy.color}50)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current Energy Info */}
        <motion.div
          key={selectedEnergy}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8"
          style={{ borderColor: `${currentEnergy?.color}40` }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${currentEnergy?.color}40, ${currentEnergy?.color}20)` }}
            >
              {currentEnergy?.icon}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{currentEnergy?.name} Energy</h2>
              <p className="text-gray-400">{currentEnergy?.description}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: currentEnergy?.color }}>
                {currentEnergy?.bpm}
              </p>
              <p className="text-sm text-gray-400">BPM Range</p>
            </div>
          </div>
        </motion.div>

        {/* Wave Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-end justify-center gap-1 h-24">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-full"
                style={{ background: currentEnergy?.color }}
                animate={{
                  height: [
                    Math.random() * 30 + 10,
                    Math.random() * 60 + 30,
                    Math.random() * 30 + 10
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader" />
          </div>
        ) : tracks.length > 0 ? (
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
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tracks found in this energy range.</p>
          </div>
        )}

        {/* Energy Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {energyLevels.map((energy) => (
            <div 
              key={energy.id}
              className="glass rounded-xl p-4 text-center"
              style={{ borderColor: `${energy.color}30` }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: energy.color }}>
                {Math.floor(Math.random() * 500) + 100}
              </p>
              <p className="text-sm text-gray-400">{energy.name} tracks</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default EnergyWave