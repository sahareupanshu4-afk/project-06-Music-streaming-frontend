import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Heart, Clock, ListMusic, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { favoritesApi, recentlyPlayedApi, playlistsApi } from '../lib/supabase'
import TrackCard from '../components/Track/TrackCard'
import { Link } from 'react-router-dom'

const Library = () => {
  const { user } = useAuth()
  const { playTrack } = usePlayer()
  
  const [activeTab, setActiveTab] = useState('playlists')
  const [playlists, setPlaylists] = useState([])
  const [favorites, setFavorites] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLibraryData()
    }
  }, [user])

  const fetchLibraryData = async () => {
    try {
      const [playlistsRes, favoritesRes, recentRes] = await Promise.all([
        playlistsApi.getByUser(user.id),
        favoritesApi.getByUser(user.id),
        recentlyPlayedApi.getByUser(user.id, 20)
      ])

      setPlaylists(playlistsRes.data || [])
      setFavorites(favoritesRes.data || [])
      setRecentlyPlayed(recentRes.data || [])
    } catch (error) {
      console.error('Error fetching library data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'recent', label: 'Recently Played', icon: Clock }
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Your Library</h1>
          <p className="text-gray-400">Your personal music collection</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-purple text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'playlists' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Create Playlist Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-6"
            >
              <button className="glass rounded-xl p-6 w-full md:w-auto flex items-center justify-center gap-3 hover:border-neon-purple/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-neon-purple" />
                </div>
                <span className="font-medium">Create New Playlist</span>
              </button>
            </motion.div>

            {playlists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-xl p-4 cursor-pointer"
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
                    <h3 className="font-medium truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.playlist_tracks?.length || 0} tracks
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <ListMusic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No playlists yet</p>
                <p className="text-sm mt-2">Create your first playlist to get started</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {favorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard 
                      track={item.tracks}
                      onPlay={() => playTrack(item.tracks, favorites.map(f => f.tracks))}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No favorite tracks yet</p>
                <p className="text-sm mt-2">Like tracks to add them to your favorites</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'recent' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {recentlyPlayed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recentlyPlayed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard 
                      track={item.tracks}
                      onPlay={() => playTrack(item.tracks, recentlyPlayed.map(r => r.tracks))}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No listening history yet</p>
                <p className="text-sm mt-2">Start playing tracks to build your history</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Library