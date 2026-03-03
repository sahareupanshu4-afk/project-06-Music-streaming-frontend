import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'
import { tracksApi } from '../lib/supabase'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import RealmSphere from '../components/Realm/RealmSphere'
import TrackCard from '../components/Track/TrackCard'

const Realms = () => {
  const { playTrack } = usePlayer()
  const { REALM_THEMES } = useTheme()
  const [selectedRealm, setSelectedRealm] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)

  // All available realms
  const realms = [
    { 
      id: 'electronic', 
      name: 'Electronic', 
      description: 'Synthesized beats and digital soundscapes',
      color: '#a855f7',
      icon: '⚡'
    },
    { 
      id: 'ambient', 
      name: 'Ambient', 
      description: 'Atmospheric textures and ethereal sounds',
      color: '#06b6d4',
      icon: '🌌'
    },
    { 
      id: 'hiphop', 
      name: 'Hip Hop', 
      description: 'Urban beats and rhythmic poetry',
      color: '#f97316',
      icon: '🎤'
    },
    { 
      id: 'rock', 
      name: 'Rock', 
      description: 'Guitar-driven energy and raw power',
      color: '#ef4444',
      icon: '🎸'
    },
    { 
      id: 'jazz', 
      name: 'Jazz', 
      description: 'Improvisational brilliance and smooth grooves',
      color: '#8b5cf6',
      icon: '🎷'
    },
    { 
      id: 'classical', 
      name: 'Classical', 
      description: 'Timeless orchestral masterpieces',
      color: '#6366f1',
      icon: '🎻'
    },
    { 
      id: 'pop', 
      name: 'Pop', 
      description: 'Chart-topping hits and catchy melodies',
      color: '#ec4899',
      icon: '💫'
    },
    { 
      id: 'rnb', 
      name: 'R&B', 
      description: 'Soulful rhythms and smooth vocals',
      color: '#10b981',
      icon: '🎵'
    },
    { 
      id: 'lofi', 
      name: 'Lo-Fi', 
      description: 'Chill beats for studying and relaxation',
      color: '#64748b',
      icon: '🎧'
    },
    { 
      id: 'podcast', 
      name: 'Podcasts', 
      description: 'Stories, conversations, and knowledge',
      color: '#14b8a6',
      icon: '🎙️'
    },
  ]

  useEffect(() => {
    if (selectedRealm) {
      fetchRealmTracks(selectedRealm)
    }
  }, [selectedRealm])

  const fetchRealmTracks = async (realmId) => {
    setLoading(true)
    try {
      const { data } = await tracksApi.getByRealm(realmId)
      setTracks(data || [])
    } catch (error) {
      console.error('Error fetching realm tracks:', error)
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Sound Realms</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore distinct musical universes, each with its own sonic identity and atmosphere
          </p>
        </motion.div>

        {/* Realms Universe Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {realms.map((realm, index) => (
            <motion.div
              key={realm.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setSelectedRealm(realm.id)}
              className="cursor-pointer"
            >
              <div 
                className={`glass rounded-2xl p-6 text-center transition-all duration-300 ${
                  selectedRealm === realm.id ? 'ring-2' : ''
                }`}
                style={{ 
                  borderColor: selectedRealm === realm.id ? realm.color : 'transparent',
                  ringColor: realm.color
                }}
              >
                <div 
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${realm.color}40, ${realm.color}20)` 
                  }}
                >
                  {realm.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{realm.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{realm.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Realm Tracks */}
        {selectedRealm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles 
                  className="w-6 h-6"
                  style={{ color: realms.find(r => r.id === selectedRealm)?.color }}
                />
                {realms.find(r => r.id === selectedRealm)?.name} Realm
              </h2>
              <Link 
                to={`/realms/${selectedRealm}`}
                className="text-sm text-neon-purple hover:underline"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader" />
              </div>
            ) : tracks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {tracks.slice(0, 10).map((track, index) => (
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
                <p>No tracks found in this realm yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Featured Realms Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Featured Realms</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Electronic Universe */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.1))`
              }}
            >
              <div className="relative z-10">
                <span className="text-5xl mb-4 block">⚡</span>
                <h3 className="text-2xl font-bold mb-2">Electronic Universe</h3>
                <p className="text-gray-400 mb-4">
                  Dive into synthesized beats, pulsing basslines, and digital soundscapes
                </p>
                <Link 
                  to="/realms/electronic"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Explore
                </Link>
              </div>
              {/* Background decoration */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-neon-purple/20 blur-3xl" />
            </motion.div>

            {/* Lo-Fi Dreams */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(148, 163, 184, 0.1))`
              }}
            >
              <div className="relative z-10">
                <span className="text-5xl mb-4 block">🎧</span>
                <h3 className="text-2xl font-bold mb-2">Lo-Fi Dreams</h3>
                <p className="text-gray-400 mb-4">
                  Chill beats for studying, relaxing, and late-night contemplation
                </p>
                <Link 
                  to="/realms/lofi"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  Explore
                </Link>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-gray-500/20 blur-3xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Realms