import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Music, 
  Heart, 
  Clock, 
  TrendingUp,
  Headphones,
  Settings,
  Edit3
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import { favoritesApi, recentlyPlayedApi, playlistsApi } from '../lib/supabase'
import TrackCard from '../components/Track/TrackCard'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const Profile = () => {
  const { user, profile } = useAuth()
  const { getEnergyLevel } = usePlayer()
  const { getEnergyColor, getRealmTheme } = useTheme()
  
  const [favorites, setFavorites] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      try {
        const { data: favData } = await favoritesApi.getByUser(user.id)
        setFavorites(favData || [])
        
        const { data: recentData } = await recentlyPlayedApi.getByUser(user.id, 10)
        setRecentlyPlayed(recentData || [])
        
        const { data: playlistData } = await playlistsApi.getByUser(user.id)
        setPlaylists(playlistData || [])
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [user])

  // Sound DNA visualization data
  const soundDNA = profile?.sound_dna_json || {
    top_energy: 'flow',
    dominant_realm: 'electronic',
    listening_consistency: 50,
    favorite_artists: []
  }

  // Energy distribution for chart
  const energyData = [
    { name: 'Calm', value: 25, color: '#4ade80' },
    { name: 'Flow', value: 35, color: '#60a5fa' },
    { name: 'Drive', value: 25, color: '#f472b6' },
    { name: 'Hyper', value: 15, color: '#fb923c' }
  ]

  // Listening history for chart
  const listeningHistory = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 62 },
    { day: 'Wed', minutes: 38 },
    { day: 'Thu', minutes: 85 },
    { day: 'Fri', minutes: 120 },
    { day: 'Sat', minutes: 95 },
    { day: 'Sun', minutes: 78 }
  ]

  // Stats
  const stats = [
    { label: 'Favorite Tracks', value: favorites.length, icon: Heart, color: '#ec4899' },
    { label: 'Hours Listened', value: '127', icon: Clock, color: '#06b6d4' },
    { label: 'Playlists', value: playlists.length, icon: Music, color: '#a855f7' },
    { label: 'Artists Discovered', value: soundDNA.favorite_artists?.length || 0, icon: TrendingUp, color: '#10b981' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-pink/10 to-neon-blue/10" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-3xl font-bold"
            >
              {user?.email?.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">
                {user?.user_metadata?.name || 'Sound Explorer'}
              </h1>
              <p className="text-gray-400 mb-4">{user?.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-neon-purple/20 text-neon-purple">
                  {soundDNA.dominant_realm?.toUpperCase()} REALM
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: `${getEnergyColor(soundDNA.top_energy)}20`,
                    color: getEnergyColor(soundDNA.top_energy)
                  }}
                >
                  {soundDNA.top_energy?.toUpperCase()} ENERGY
                </span>
              </div>
            </div>

            <button className="btn-secondary flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <stat.icon 
                className="w-6 h-6 mb-3"
                style={{ color: stat.color }}
              />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'favorites', 'history', 'playlists'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sound DNA Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-neon-purple" />
                Your Sound DNA
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                {energyData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Listening Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Listening Activity</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={listeningHistory}>
                    <defs>
                      <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a25', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="#a855f7" 
                      fillOpacity={1} 
                      fill="url(#colorMinutes)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-bold mb-6">Your Favorite Tracks</h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {favorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard track={item.tracks} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No favorite tracks yet. Start exploring and add some!</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-bold mb-6">Recently Played</h3>
            {recentlyPlayed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recentlyPlayed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard track={item.tracks} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No listening history yet. Start playing some tracks!</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'playlists' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-bold mb-6">Your Playlists</h3>
            {playlists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div 
                      className="aspect-square rounded-lg mb-3 flex items-center justify-center"
                      style={{ 
                        background: playlist.theme_color 
                          ? `linear-gradient(135deg, ${playlist.theme_color}, ${playlist.theme_color}66)`
                          : 'linear-gradient(135deg, #a855f7, #ec4899)'
                      }}
                    >
                      <Music className="w-12 h-12 text-white/50" />
                    </div>
                    <h4 className="font-medium truncate">{playlist.name}</h4>
                    <p className="text-sm text-gray-400">
                      {playlist.playlist_tracks?.length || 0} tracks
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No playlists yet. Create your first one!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Profile