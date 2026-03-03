import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Compass,
  Play,
  Zap,
  Headphones
} from 'lucide-react'
import { tracksApi, recentlyPlayedApi } from '../lib/supabase'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import TrackCard from '../components/Track/TrackCard'
import RealmSphere from '../components/Realm/RealmSphere'

const sampleTracks = [
  {
    id: '1',
    title: 'Calm Ocean Waves',
    artist: 'Nature Sounds',
    album: 'Relaxing Nature',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 180,
    bpm: 60,
    energy_level: 'calm',
    realm: 'ambient',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track1/300/300.jpg'
  },
  {
    id: '2',
    title: 'Morning Flow',
    artist: 'Acoustic Breeze',
    album: 'Coffee Shop Vibes',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 210,
    bpm: 105,
    energy_level: 'flow',
    realm: 'pop',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track2/300/300.jpg'
  },
  {
    id: '3',
    title: 'City Drive',
    artist: 'Electronic Pulse',
    album: 'Urban Nights',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 240,
    bpm: 130,
    energy_level: 'drive',
    realm: 'electronic',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track3/300/300.jpg'
  },
  {
    id: '4',
    title: 'Workout Energy',
    artist: 'Fitness Beats',
    album: 'Gym Motivation',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 180,
    bpm: 160,
    energy_level: 'hyper',
    realm: 'hiphop',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track4/300/300.jpg'
  },
  {
    id: '5',
    title: 'Jazz Evening',
    artist: 'Smooth Trio',
    album: 'Late Night Sessions',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 300,
    bpm: 85,
    energy_level: 'calm',
    realm: 'jazz',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track5/300/300.jpg'
  },
  {
    id: '6',
    title: 'Rock Anthem',
    artist: 'Electric Storm',
    album: 'Classic Rock',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 240,
    bpm: 140,
    energy_level: 'drive',
    realm: 'rock',
    play_count: 0,
    cover_url: 'https://picsum.photos/seed/track6/300/300.jpg'
  }
]

const Home = () => {
  const { user } = useAuth()
  const { playTrack, getEnergyLevel } = usePlayer()
  const { getRealmTheme, getEnergyColor } = useTheme()
  
  const [trendingTracks, setTrendingTracks] = useState(sampleTracks)
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [recommendations, setRecommendations] = useState(sampleTracks.slice(0, 6))
  const [loading, setLoading] = useState(false)

  const realms = [
    { id: 'electronic', name: 'Electronic', color: '#a855f7', tracks: 234 },
    { id: 'ambient', name: 'Ambient', color: '#06b6d4', tracks: 156 },
    { id: 'hiphop', name: 'Hip Hop', color: '#f97316', tracks: 312 },
    { id: 'rock', name: 'Rock', color: '#ef4444', tracks: 198 },
    { id: 'jazz', name: 'Jazz', color: '#8b5cf6', tracks: 87 },
    { id: 'pop', name: 'Pop', color: '#ec4899', tracks: 445 },
    { id: 'rnb', name: 'R&B', color: '#10b981', tracks: 167 },
    { id: 'lofi', name: 'Lo-Fi', color: '#64748b', tracks: 123 },
  ]

  const energyWaves = [
    { id: 'calm', name: 'Calm', bpm: '0-90', color: '#4ade80', icon: '🌊' },
    { id: 'flow', name: 'Flow', bpm: '90-120', color: '#60a5fa', icon: '🎵' },
    { id: 'drive', name: 'Drive', bpm: '120-150', color: '#f472b6', icon: '⚡' },
    { id: 'hyper', name: 'Hyper', bpm: '150+', color: '#fb923c', icon: '🔥' },
  ]

  useEffect(() => {
    const sampleTracks = tracksApi.sampleTracks
    setTrendingTracks(sampleTracks)
    setRecommendations(sampleTracks.slice(0, 6))
    setLoading(false)
  }, [user])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <section className="px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Your Sound Universe</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Explore infinite soundscapes, discover new realms, and let the music guide your journey
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Link to="/realms" className="btn-primary flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Explore Realms
            </Link>
            <Link to="/energy" className="btn-secondary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Energy Waves
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-neon-purple" />
              Sound Realms
            </h2>
            <p className="text-gray-400">Enter a universe of infinite sound possibilities</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {realms.map((realm, index) => (
              <motion.div
                key={realm.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Link to={`/realms/${realm.id}`}>
                  <RealmSphere realm={realm} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-energy-flow" />
              Energy Waves
            </h2>
            <p className="text-gray-400">Find your perfect energy level</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {energyWaves.map((wave, index) => (
              <motion.div
                key={wave.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link to={`/energy?level=${wave.id}`}>
                  <div 
                    className="glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-opacity-50"
                    style={{ borderColor: wave.color }}
                  >
                    <div className="text-4xl mb-3">{wave.icon}</div>
                    <h3 className="text-lg font-semibold mb-1">{wave.name}</h3>
                    <p className="text-sm text-gray-400">{wave.bpm} BPM</p>
                    <div 
                      className="mt-4 h-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${wave.color}, ${wave.color}50)` }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {user && recentlyPlayed.length > 0 && (
        <section className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Clock className="w-6 h-6 text-neon-cyan" />
                Recently Played
              </h2>
              <p className="text-gray-400">Continue where you left off</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyPlayed.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrackCard 
                    track={item.tracks} 
                    onPlay={() => playTrack(item.tracks, recentlyPlayed.map(r => r.tracks))}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-neon-pink" />
              Trending Now
            </h2>
            <p className="text-gray-400">What the universe is listening to</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingTracks.slice(0, 10).map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard 
                  track={track} 
                  rank={index + 1}
                  onPlay={() => playTrack(track, trendingTracks)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-neon-green" />
              For You
            </h2>
            <p className="text-gray-400">Curated based on your listening journey</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard 
                  track={track} 
                  onPlay={() => playTrack(track, recommendations)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-radial from-neon-purple/20 via-transparent to-transparent" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start Your <span className="gradient-text">Sound Journey</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Join millions of listeners exploring the sound universe. 
                  Create your personal Sound DNA and discover music that resonates with your soul.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-primary text-lg px-8 py-4">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home